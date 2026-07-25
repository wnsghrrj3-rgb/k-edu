/* ============================================================
   케이메이커 P0 코어 (MK_P0) — 순수 로직 (DOM/fabric 무의존, node 테스트 가능)
   담당: ① 퍼지 검색  ② 자연어 타임라인 파서  ③ 매직 리사이즈 재배치
        ④ AI 코치 규칙  ⑤ 원클릭 테마 계획
   배선(p0.js)이 이 결과를 캔버스에 적용한다.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KM_P0_CORE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- 공통 유틸 ---------- */
  function lum(hex) { // 상대 휘도 0~1
    if (!hex || hex[0] !== '#') return 1;
    var h = hex.length === 4 ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex;
    var r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
    var f = function (c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrast(a, b) { var L1 = lum(a), L2 = lum(b); var hi = Math.max(L1, L2), lo = Math.min(L1, L2); return (hi + 0.05) / (lo + 0.05); }

  /* ========== ① 퍼지 검색 ========== */
  /* 질의 vs 후보 문자열(이름·한글키워드) 점수. 0=불일치. 높을수록 좋음 */
  function fuzzyScore(q, text) {
    if (!q || !text) return 0;
    q = String(q).toLowerCase().trim(); text = String(text).toLowerCase();
    if (!q) return 0;
    var i = text.indexOf(q);
    if (i >= 0) return 100 - Math.min(40, i) + Math.min(20, q.length * 2); // 연속 일치 — 앞일수록·길수록 가점
    // 부분어(공백·쉼표 분리) 일치
    var parts = q.split(/[\s,]+/).filter(Boolean), hit = 0;
    for (var p = 0; p < parts.length; p++) if (text.indexOf(parts[p]) >= 0) hit++;
    if (hit && hit === parts.length) return 60 + hit * 4;
    if (hit) return 30 + hit * 4;
    // 부분열(subsequence) — 최소 2자
    if (q.length >= 2) {
      var ti = 0, matched = 0;
      for (var c = 0; c < q.length; c++) { var f = text.indexOf(q[c], ti); if (f < 0) { matched = 0; break; } matched++; ti = f + 1; }
      if (matched === q.length) return 12 + Math.max(0, 10 - (ti - q.length));
    }
    return 0;
  }
  /* 항목 배열 검색 — items: [{name, keys, ...}] → 점수순 상위 n */
  function fuzzySearch(q, items, n) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var s = Math.max(fuzzyScore(q, it.name || ''), fuzzyScore(q, it.keys || ''));
      if (s > 0) out.push({ item: it, score: s });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, n || 12).map(function (x) { return x.item; });
  }

  /* ========== ② 자연어 타임라인 파서 ========== */
  /* ctx: { objects:[{id, kind:'text'|'image'|'icon'|'shape'|'video', label, size}], sceneCount, selectedId }
     반환: { ok, ops:[...], summary } — ops는 배선이 해석
     op 종류: setAnim {ids, patch:{in/loop/fx}}, stagger {ids, step}, clearAnim {ids},
              sceneDur {index, sec}, addScene {} */
  var IN_MAP = [
    [/팝|튀어나|뿅/, 'pop'], [/스르륵|페이드|서서히|살며시/, 'fadeIn'],
    [/왼쪽에서/, 'slideL'], [/오른쪽에서/, 'slideR'],
    [/아래에서|떠오르|떠올라/, 'slideUp'], [/위에서|떨어지|떨어져|낙하/, 'drop'],
  ];
  var LOOP_MAP = [
    [/둥둥|떠다니/, 'float'], [/두근|콩닥|맥박/, 'pulse'], [/빙글|회전|돌아|돌게|돌려/, 'spin'],
    [/흔들|살랑/, 'shake'], [/깜빡|깜박/, 'twinkle'],
  ];
  var FX_MAP = [
    [/금가루|골드|반짝.*(팡|터)/, 'goldburst'], [/글자.*(하나|한\s*글자)|한\s*글자씩/, 'charpop'],
    [/도장|쾅/, 'stamp'], [/스포트|조명/, 'spotlight'], [/궤적|별가루/, 'trail'], [/네온|발광/, 'neon'],
  ];
  var ORD = { '첫': 0, '한': 0, '두': 1, '둘': 1, '세': 2, '셋': 2, '네': 3, '넷': 3, '다섯': 4, '여섯': 5, '일곱': 6, '여덟': 7 };

  function pickTargets(t, ctx) {
    var objs = ctx.objects || [];
    var kind = null;
    if (/제목|타이틀/.test(t)) {
      var texts = objs.filter(function (o) { return o.kind === 'text'; });
      if (!texts.length) return [];
      texts.sort(function (a, b) { return (b.size || 0) - (a.size || 0); });
      return [texts[0].id];
    }
    if (/글자|텍스트|문구/.test(t)) kind = 'text';
    else if (/사진|이미지|그림/.test(t)) kind = 'image';
    else if (/영상|비디오/.test(t)) kind = 'video';
    else if (/아이콘|스티커/.test(t)) kind = 'icon';
    else if (/도형/.test(t)) kind = 'shape';
    var pool = kind ? objs.filter(function (o) { return o.kind === kind; }) : objs.slice();
    // 서수: "두 번째 사진"
    var m = t.match(/(첫|한|두|둘|세|셋|네|넷|다섯|여섯|일곱|여덟|\d+)\s*(번째|번)/);
    if (m && !/씬|장면/.test(t)) {
      var idx = ORD[m[1]] != null ? ORD[m[1]] : (parseInt(m[1], 10) - 1);
      return pool[idx] ? [pool[idx].id] : [];
    }
    if (/이거|이것|선택/.test(t)) return ctx.selectedId != null ? [ctx.selectedId] : [];
    if (/모든|모두|전부|다\s/.test(t) || kind) return pool.map(function (o) { return o.id; });
    // 대상 미지정 → 선택된 것, 없으면 전부
    if (ctx.selectedId != null) return [ctx.selectedId];
    return pool.map(function (o) { return o.id; });
  }

  function parseCommand(text, ctx) {
    var t = String(text || '').trim();
    if (!t) return { ok: false };
    ctx = ctx || { objects: [], sceneCount: 1 };
    var ops = [], notes = [];

    // 씬 명령
    var sm = t.match(/(첫|두|둘|세|셋|네|넷|다섯|\d+)\s*(?:번째)?\s*(?:씬|장면)\s*(?:을|를)?\s*(\d+(?:\.\d+)?)\s*초/);
    if (sm) {
      var si = ORD[sm[1]] != null ? ORD[sm[1]] : (parseInt(sm[1], 10) - 1);
      ops.push({ op: 'sceneDur', index: si, sec: parseFloat(sm[2]) });
      notes.push((si + 1) + '번째 씬 → ' + sm[2] + '초');
    } else {
      var sm2 = t.match(/(?:씬|장면)\s*(?:을|를)?\s*(\d+(?:\.\d+)?)\s*초/);
      if (sm2) { ops.push({ op: 'sceneDur', index: -1, sec: parseFloat(sm2[1]) }); notes.push('현재 씬 → ' + sm2[1] + '초'); }
    }
    if (/(씬|장면).*(추가|하나 더|늘려)/.test(t)) { ops.push({ op: 'addScene' }); notes.push('씬 추가'); }

    // 애니메이션 제거
    if (/(애니|모션|효과|움직임).*(없애|빼|꺼|제거|지워)|멈춰|정지/.test(t)) {
      var ids0 = pickTargets(t, ctx);
      if (ids0.length) { ops.push({ op: 'clearAnim', ids: ids0 }); notes.push(ids0.length + '개 요소 모션 제거'); }
    } else {
      // 애니메이션 부여
      var patch = {}, label = [];
      for (var i = 0; i < IN_MAP.length; i++) if (IN_MAP[i][0].test(t)) { patch.in = { type: IN_MAP[i][1] }; label.push('등장:' + IN_MAP[i][1]); break; }
      for (var l = 0; l < LOOP_MAP.length; l++) if (LOOP_MAP[l][0].test(t)) { patch.loop = { type: LOOP_MAP[l][1] }; label.push('상시:' + LOOP_MAP[l][1]); break; }
      for (var f = 0; f < FX_MAP.length; f++) if (FX_MAP[f][0].test(t)) { patch.fx = { type: FX_MAP[f][1] }; label.push('이펙트:' + FX_MAP[f][1]); break; }
      // "반짝반짝"이 twinkle에 잡혔는데 loop 문맥이 아니면 그대로 두되, "반짝" 단독 + 별가루 없음 → twinkle 유지
      if (!patch.loop && /반짝/.test(t) && !patch.fx) { patch.loop = { type: 'twinkle' }; label.push('상시:twinkle'); }
      var dm = t.match(/(\d+(?:\.\d+)?)\s*초\s*(?:뒤|후|있다|늦게)/);
      if (dm) { patch.in = patch.in || { type: 'fadeIn' }; patch.in.delay = parseFloat(dm[1]); label.push(dm[1] + '초 뒤'); }
      if (/동시에|같이 나오/.test(t)) { patch.in = patch.in || { type: 'fadeIn' }; patch.in.delay = 0; }

      if (patch.in || patch.loop || patch.fx) {
        var ids = pickTargets(t, ctx);
        if (ids.length) {
          ops.push({ op: 'setAnim', ids: ids, patch: patch });
          notes.push(ids.length + '개 요소 · ' + label.join(' · '));
          if (/순서대로|차례로|하나씩\s*(등장|나오)/.test(t)) { ops.push({ op: 'stagger', ids: ids, step: 0.5 }); notes.push('0.5초 간격 순차 등장'); }
        }
      } else if (/순서대로|차례로|하나씩\s*(등장|나오)/.test(t)) {
        var ids2 = pickTargets(t, ctx);
        if (ids2.length) {
          ops.push({ op: 'setAnim', ids: ids2, patch: { in: { type: 'slideUp' } } });
          ops.push({ op: 'stagger', ids: ids2, step: 0.5 });
          notes.push(ids2.length + '개 요소 순차 등장 (0.5초 간격)');
        }
      }
    }

    if (!ops.length) return { ok: false };
    return { ok: true, ops: ops, summary: notes.join(' / ') };
  }

  /* ========== ③ 매직 리사이즈 재배치 ========== */
  /* objects: [{id, cx, cy, w, h, isBg}] (cx,cy 중심 · w,h 스케일 반영 크기)
     반환: [{id, cx, cy, scale}] — scale은 기존 scaleX/Y에 곱할 배율 */
  function magicLayout(objects, oldW, oldH, newW, newH) {
    var s = Math.min(newW / oldW, newH / oldH); // 요소 크기 공통 배율 (형태 유지)
    var out = [];
    for (var i = 0; i < objects.length; i++) {
      var o = objects[i];
      if (o.isBg) { out.push({ id: o.id, cx: newW / 2, cy: newH / 2, scale: Math.max(newW / o.w, newH / o.h) }); continue; }
      out.push({ id: o.id, cx: anchorMap(o.cx, o.w * s, oldW, newW), cy: anchorMap(o.cy, o.h * s, oldH, newH), scale: s });
    }
    return out;
  }
  /* 한 축 재배치: 가장자리 근접(여백<12%)이면 여백 비율 유지, 아니면 중심 비율 매핑 */
  function anchorMap(c, size, oldD, newD) {
    var half = size / 2;
    var lead = c - half, trail = oldD - (c + half);
    var edge = oldD * 0.12;
    if (lead <= edge && lead <= trail) return lead * (newD / oldD) + half;            // 앞쪽 붙임
    if (trail <= edge && trail < lead) return newD - trail * (newD / oldD) - half;    // 뒤쪽 붙임
    return (c / oldD) * newD;                                                          // 비율 유지
  }

  /* ========== ④ AI 코치 ========== */
  /* objs: [{id, kind, text, fontFamily, fontSize, fill, cx, cy, w, h}], cv: {w, h, bg}
     반환: [{rule, msg, fix:{...}}] — fix는 배선이 해석 */
  function coach(objs, cv) {
    var out = [], texts = objs.filter(function (o) { return o.kind === 'text'; });

    // R1 폰트 과다 (>3종)
    var fams = {}; texts.forEach(function (o) { if (o.fontFamily) fams[o.fontFamily] = (fams[o.fontFamily] || 0) + 1; });
    var famList = Object.keys(fams);
    if (famList.length > 3) {
      famList.sort(function (a, b) { return fams[b] - fams[a]; });
      var keep = famList.slice(0, 2);
      var ids = texts.filter(function (o) { return keep.indexOf(o.fontFamily) < 0; }).map(function (o) { return o.id; });
      out.push({ rule: 'fonts', msg: '폰트가 ' + famList.length + '종이에요 — 2종으로 정리하면 훨씬 정돈돼 보여요', fix: { type: 'unifyFont', ids: ids, to: keep[0] } });
    }
    // R2 너무 작은 글자
    texts.forEach(function (o) {
      var eff = o.fontSize || 0;
      if (eff > 0 && eff < 13) out.push({ rule: 'tiny', msg: '"' + short(o.text) + '" 글자가 너무 작아요 (' + Math.round(eff) + 'px)', fix: { type: 'fontSize', ids: [o.id], to: 14 } });
    });
    // R3 배경 대비 부족
    texts.forEach(function (o) {
      if (!o.fill || o.fill[0] !== '#') return;
      var cr = contrast(o.fill, cv.bg || '#FFFFFF');
      if (cr < 2.2) {
        var to = lum(cv.bg || '#FFFFFF') > 0.5 ? '#2D3748' : '#FFFFFF';
        out.push({ rule: 'contrast', msg: '"' + short(o.text) + '" 글자색이 배경과 비슷해 잘 안 보여요', fix: { type: 'fill', ids: [o.id], to: to } });
      }
    });
    // R4 캔버스 밖 요소
    objs.forEach(function (o) {
      if (o.isBg) return;
      if (o.cx < 0 || o.cx > cv.w || o.cy < 0 || o.cy > cv.h)
        out.push({ rule: 'off', msg: '캔버스 밖으로 나간 요소가 있어요', fix: { type: 'pullIn', ids: [o.id] } });
    });
    // R5 아슬한 가장자리 (여백 3~14px — 붙일지 띄울지 애매한 상태)
    objs.forEach(function (o) {
      if (o.isBg || o.kind === 'shape') return;
      var l = o.cx - o.w / 2, t = o.cy - o.h / 2, r = cv.w - (o.cx + o.w / 2), b = cv.h - (o.cy + o.h / 2);
      var m = Math.min(l, t, r, b);
      if (m > 2 && m < 14) out.push({ rule: 'edge', msg: '가장자리에 아슬하게 걸친 요소가 있어요 — 여백 24px로 띄워 드릴까요?', fix: { type: 'margin', ids: [o.id], to: 24 } });
    });
    // R6 제목 부재 (요소 4개 이상인데 큰 글자 없음)
    if (objs.length >= 4 && texts.length && !texts.some(function (o) { return (o.fontSize || 0) >= 28; }))
      out.push({ rule: 'title', msg: '눈에 띄는 제목이 없어요 — 가장 큰 글자를 제목 크기로 키워 드릴까요?', fix: { type: 'promoteTitle' } });

    // 규칙당 1건으로 압축 (같은 rule 중복 제거)
    var seen = {}, dedup = [];
    out.forEach(function (s) { if (!seen[s.rule]) { seen[s.rule] = 1; dedup.push(s); } });
    return dedup;
  }
  function short(t) { t = String(t || '').replace(/\n/g, ' '); return t.length > 8 ? t.slice(0, 8) + '…' : t; }

  /* ========== ⑤ 원클릭 테마 ========== */
  var THEMES = [
    { id: 'jeongal', n: '정갈한 문서', head: 'Gowun Batang', body: 'Gowun Dodum', bg: '#FBFAF7', ink: '#2B2B28', accent: '#8A6F4D', soft: '#EFE9DD' },
    { id: 'pastel', n: '파스텔 교실', head: 'Hakgyoansim Monggeul', body: 'Gowun Dodum', bg: '#FFF7F9', ink: '#4A4458', accent: '#F49CBB', soft: '#DCEBFF' },
    { id: 'neon', n: '네온 팝', head: 'Paperlogy', body: 'IBM Plex Sans KR', bg: '#17162B', ink: '#F4F2FF', accent: '#8B7CFF', soft: '#2A2947' },
    { id: 'nature', n: '초록 자연', head: 'Hakgyoansim Namu', body: 'Gowun Dodum', bg: '#F4F8F0', ink: '#2F3B2C', accent: '#5B8C4A', soft: '#E3EED9' },
    { id: 'retro', n: '둥근 레트로', head: 'DungGeunMo', body: 'NanumSquareRound', bg: '#FFF6E5', ink: '#3F3020', accent: '#E8743B', soft: '#FBE3B9' },
    { id: 'ink', n: '흑백 잉크', head: 'Song Myung', body: 'Nanum Myeongjo', bg: '#FFFFFF', ink: '#111111', accent: '#C0392B', soft: '#EEEEEE' },
  ];
  /* objs: coach와 동일 형태 → 패치 목록 [{id, set:{...}}] + 캔버스 {bg} */
  function applyThemePlan(objs, theme) {
    var patches = [], texts = objs.filter(function (o) { return o.kind === 'text'; });
    texts.sort(function (a, b) { return (b.fontSize || 0) - (a.fontSize || 0); });
    var headCut = texts.length ? Math.max(28, (texts[0].fontSize || 0) * 0.8) : 28;
    texts.forEach(function (o, i) {
      var isHead = i === 0 || (o.fontSize || 0) >= headCut;
      patches.push({ id: o.id, set: { fontFamily: isHead ? theme.head : theme.body, fill: i === 0 ? theme.accent : theme.ink } });
    });
    var shapes = objs.filter(function (o) { return o.kind === 'shape' && !o.isBg; });
    shapes.sort(function (a, b) { return b.w * b.h - a.w * a.h; }); // 큰 면부터 옅은 색
    shapes.forEach(function (o, i) {
      patches.push({ id: o.id, set: { fill: i === 0 ? theme.soft : (i % 2 ? theme.accent : theme.soft) } });
    });
    // 격자 스냅 (8px) — 문서 정돈
    objs.forEach(function (o) {
      if (o.isBg) return;
      var cx = Math.round(o.cx / 8) * 8, cy = Math.round(o.cy / 8) * 8;
      if (cx !== o.cx || cy !== o.cy) patches.push({ id: o.id, move: { cx: cx, cy: cy } });
    });
    return { patches: patches, canvasBg: theme.bg };
  }

  return {
    fuzzyScore: fuzzyScore, fuzzySearch: fuzzySearch,
    parseCommand: parseCommand,
    magicLayout: magicLayout, anchorMap: anchorMap,
    coach: coach,
    THEMES: THEMES, applyThemePlan: applyThemePlan,
    _lum: lum, _contrast: contrast,
  };
});
