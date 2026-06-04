/* ============================================================================
   K-edu 케이티처 — 케이랩(KLab) 통합 조작 교구 엔진
   - 전 과목 조작 도구의 단일 진입점. 도구를 이름으로 등록하고,
     차시 데이터의 설정대로 마운트한다.
   - 엔진(teacher-engine.js)은 이 파일의 mount() 하나만 안다.
     새 도구(분수·시계·자릿값·과학·사회)는 별도 모듈 파일에서 register()로
     자기를 등록하면 된다. 엔진은 안 건드린다.
   - 차시 데이터 형식:
       { block:"klab", data:{ tool:"shape3d", config:{...} } }
   ============================================================================ */
(function () {
  if (window.KLab) return;

  var registry = {};

  function register(name, mountFn) {
    if (typeof mountFn !== 'function') return;
    registry[name] = mountFn;
  }

  // el = 마운트할 컨테이너 element, toolName = 도구 이름, config = 차시별 설정
  // 반환: 도구가 정리(cleanup) 함수를 주면 그대로 반환(슬라이드 이동 시 호출용)
  function mount(el, toolName, config) {
    if (!el) return;
    el.innerHTML = '';
    var fn = registry[toolName];
    if (!fn) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:#888;">'
        + '준비 중인 교구입니다: <b>' + (toolName || '(이름 없음)') + '</b></div>';
      return;
    }
    try {
      return fn(el, config || {});
    } catch (e) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:#c0392b;">'
        + '교구를 불러오지 못했어요.</div>';
      if (window.console) console.error('[KLab] mount 실패:', toolName, e);
    }
  }

  function has(name) { return !!registry[name]; }
  function list() { return Object.keys(registry); }

  window.KLab = { register: register, mount: mount, has: has, list: list };

  // 옛 이름 호환 (혹시 남은 참조 대비) — 같은 객체를 가리킴
  window.MathTools = window.KLab;
})();
