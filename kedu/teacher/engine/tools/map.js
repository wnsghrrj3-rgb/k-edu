/* ============================================================================
   케이랩 도구 모듈 — 지도 읽기 (map) v2  [사회 · 3학년 · 우리 고장 · 브이월드 실제 지도]
   labs/jido_proto.html(브이월드 전국 실제 지도: 기호 ⇄ 항공, 우리 동네 검색,
   행정구역 백지도 + 기호 직접 찍기)을 케이랩 도구로 임베드.
   - v1(이모지 양식화 동네)은 폐기, 실제 국가 지도로 교체.
   - config: { start: 'symbol'|'real'|'blank'|'d3' }  (카드별 진입 모드)
   - 브이월드 인증키는 임베드 페이지에 도메인(keduclass.com) 묶임 → 동일 출처 iframe에서 동작.
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('map', function (el, config) {
    var ok = { symbol: 1, real: 1, blank: 1, d3: 1 };
    var start = (config && ok[config.start]) ? config.start : 'symbol';
    var src = '/labs/jido_proto.html?start=' + start;
    el.innerHTML =
      '<div style="width:100%;height:72vh;min-height:460px;border-radius:22px;overflow:hidden;'
      + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);background:#eef2f5;">'
      + '<iframe src="' + src + '" title="우리 고장 지도"'
      + ' style="width:100%;height:100%;border:0;display:block;"'
      + ' allow="fullscreen; accelerometer; gyroscope"></iframe>'
      + '</div>';
    return function cleanup() { el.innerHTML = ''; };
  });
})();
