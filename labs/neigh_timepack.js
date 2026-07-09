/* ============================================================
   케이랩 사회실 2.0 · R2 동네 시간여행 — 순수부  window.TimePack
   설계: klab/사회실2_설계.md (R2). 네트워크·DOM 무관 = 검산 대상.

   심장 = 프레임 크로스페이드 알파. 1.0 timestreet 의 layerAlpha 불변식을
   그대로 승계(444케이스 검증 자산 — 이름만 frame 문맥으로):
     ⑴ 전 프레임 알파 합 = 1
     ⑵ 인접 두 프레임만 nonzero
     ⑶ 각 프레임 삼각 단조 · 정점 알파 1
   + 찾아라 판정(정규화 원) · 도감 요약 · 팩 스키마 검증 · 커튼 분할.

   정직 계약: 팩의 연도·출처는 화면 상시 표기(엔진은 데이터만 다룸).
   ============================================================ */
(function (W) {
  'use strict';

  function clamp01(x) { x = +x; if (!(x >= 0)) return 0; if (x > 1) return 1; return x; }

  /* ── frameAt: 슬라이더 t∈[0,1] → 인접 두 프레임 i,j 와 보간계수 frac ──
     (timestreet.eraAt 승계 — 경계 안정 위해 1e-9 여유) */
  function frameAt(t, N) {
    t = clamp01(t);
    if (N <= 1) return { i: 0, j: 0, frac: 0 };
    var seg = t * (N - 1);
    var i = Math.floor(seg + 1e-9);
    if (i > N - 1) i = N - 1; if (i < 0) i = 0;
    var frac = seg - i;
    if (frac < 1e-9) frac = 0;
    var j = (i + 1 < N) ? i + 1 : i;
    if (j === i) frac = 0;
    return { i: i, j: j, frac: frac };
  }

  /* ── layerAlpha: 프레임 idx 의 크로스페이드 알파 (불변식 ⑴⑵⑶) ── */
  function layerAlpha(t, idx, N) {
    var e = frameAt(t, N);
    if (e.i === e.j) return idx === e.i ? 1 : 0;
    if (idx === e.i) return 1 - e.frac;
    if (idx === e.j) return e.frac;
    return 0;
  }

  /* ── dominantFrame: 더 진한 프레임 = 미션 판정·연도 라벨 기준 ── */
  function dominantFrame(t, N) {
    var e = frameAt(t, N);
    return e.frac < 0.5 ? e.i : e.j;
  }

  /* ── yearAt: 슬라이더 위치의 연도(정수 라벨용, 선형 보간·반올림) ── */
  function yearAt(t, years) {
    var N = years.length;
    if (N === 0) return null;
    var e = frameAt(t, N);
    var ya = years[e.i], yb = years[e.j];
    return Math.round(ya + (yb - ya) * e.frac);
  }

  /* ── 커튼: 세로 분할선 splitX(0~1) 기준, 정규화 x 가 옛(왼)인가 오늘(오)인가 ──
     왼쪽 = 더 옛 프레임(oldIdx), 오른쪽 = 더 최근 프레임(newIdx) */
  function curtainSide(nx, splitX) { return clamp01(nx) < clamp01(splitX) ? 'old' : 'now'; }

  /* ── 찾아라 판정: 탭 정규화 좌표(nx,ny)가 타겟 원 안인가 ──
     px = [cx, cy, r] (전부 0~1 정규화 · 프레임 해상도 무관) */
  function hitTest(nx, ny, px) {
    if (!px || px.length < 3) return false;
    var dx = nx - px[0], dy = ny - px[1];
    return (dx * dx + dy * dy) <= px[2] * px[2];
  }

  /* ── findResolve: 현재 슬라이더 상태에서 '지금 물을 수 있는' 찾기 타겟만 필터 ──
     find = { ya, yb, q, px, why }. ya/yb 를 프레임 인덱스로 가진 팩 기준.
     dom = dominantFrame 인덱스. 옛것(ya) 또는 오늘것(yb) 중 화면에 그 프레임이
     지배적일 때 유효(둘 중 아무 시대나 봐도 판정 가능하게 = 관대). */
  function findAt(nx, ny, finds) {
    for (var k = 0; k < finds.length; k++) {
      if (hitTest(nx, ny, finds[k].px)) return finds[k];
    }
    return null;
  }

  /* ── 도감 요약(찾아라 진행률) — 중복·미존재 방어(museumSummary 동형) ── */
  function collectSummary(foundIds, finds) {
    var total = finds.length;
    var validIds = {};
    for (var i = 0; i < finds.length; i++) validIds[finds[i].id] = true;
    var seen = {}, found = 0;
    for (var j = 0; j < foundIds.length; j++) {
      var id = foundIds[j];
      if (validIds[id] && !seen[id]) { seen[id] = true; found++; }
    }
    return { found: found, total: total, pct: total ? Math.round(found / total * 100) : 0, done: total > 0 && found >= total };
  }

  /* ── 예측 판정(3지선다) ── */
  function predictResult(pick, answer) { return { ok: pick === answer }; }

  /* ── 팩 스키마 검증(빌드·로드 가드) ──
     불변식: frames≥2 · 연도 오름차순 · 각 프레임 {year, (img|draw), note} ·
             find.px 3원소 · find.ya/yb 가 프레임 인덱스 범위 내 · id 유일 */
  function packValidate(pack) {
    var errs = [];
    if (!pack || typeof pack !== 'object') return { ok: false, errors: ['pack 없음'] };
    var F = pack.frames;
    if (!Array.isArray(F) || F.length < 2) errs.push('frames 2개 이상 필요');
    else {
      for (var i = 0; i < F.length; i++) {
        var f = F[i];
        if (typeof f.year !== 'number') errs.push('frame[' + i + '] year 숫자 아님');
        if (!f.img && !f.draw) errs.push('frame[' + i + '] img/draw 둘 다 없음');
        if (i > 0 && F[i].year < F[i - 1].year) errs.push('연도 역순 @' + i);
      }
    }
    var finds = pack.find || [];
    var ids = {};
    for (var k = 0; k < finds.length; k++) {
      var fd = finds[k];
      if (!fd.id) errs.push('find[' + k + '] id 없음');
      else if (ids[fd.id]) errs.push('find id 중복: ' + fd.id); else ids[fd.id] = true;
      if (!Array.isArray(fd.px) || fd.px.length !== 3) errs.push('find[' + k + '] px 3원소 아님');
      var nF = Array.isArray(F) ? F.length : 0;
      if (typeof fd.ya === 'number' && (fd.ya < 0 || fd.ya >= nF)) errs.push('find[' + k + '] ya 범위밖');
      if (typeof fd.yb === 'number' && (fd.yb < 0 || fd.yb >= nF)) errs.push('find[' + k + '] yb 범위밖');
    }
    if (!pack.src) errs.push('출처(src) 없음 — 정직 계약 위반');
    return { ok: errs.length === 0, errors: errs };
  }

  var T = {
    clamp01: clamp01, frameAt: frameAt, layerAlpha: layerAlpha,
    dominantFrame: dominantFrame, yearAt: yearAt, curtainSide: curtainSide,
    hitTest: hitTest, findAt: findAt, collectSummary: collectSummary,
    predictResult: predictResult, packValidate: packValidate
  };
  W.TimePack = T;
  if (typeof module !== 'undefined' && module.exports) module.exports = T;
})(typeof window !== 'undefined' ? window : this);
