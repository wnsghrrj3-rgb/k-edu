/* kedu_kbox_adapter.js — 케이박스 결과봉투(KEDU_RESULT v1) 어댑터. 전 도구 공용.
 * 딥링크 ?cwb=<bundle_id>&cwi=<item_id> 감지 → KBox.submit(결과) 한 줄로 제출.
 * SPEC: handoff/classwork/SPEC_KBOX2_결과봉투_자동채점_학부모.md §3
 *
 * 로드 전제: kedu_config.js(getKeduDb) + @supabase/supabase-js 가 먼저 로드.
 * 케이박스 밖(cwb/cwi 없음)에서 열리면 active=false → submit은 조용히 무시(학생 활동 방해 0).
 * 세션·클라이언트 부재도 조용히 흡수(no_session/no_client) — 단독 진입 안전.
 */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var cwb = q.get('cwb'), cwi = q.get('cwi');
  var t0 = Date.now(), sent = false;

  function client() {
    if (window.sb) return window.sb;
    if (typeof getKeduDb === 'function') { try { return getKeduDb(); } catch (e) { return null; } }
    return window.supabase && window.supabase.rpc ? window.supabase : null;
  }

  window.KBox = {
    active: !!(cwb && cwi),
    bundleId: cwb || null,
    itemId: cwi || null,
    // r = { tool, kind, score, max, detail, artifact_url }
    submit: async function (r) {
      if (!this.active) return { status: 'inactive' };   // 케이박스 밖 = 조용히 무시
      if (sent) return { status: 'dup' };                 // 이중 제출 가드
      var sb = client();
      if (!sb) return { status: 'no_client' };
      var payload = {
        v: 1,
        tool: (r && r.tool) || 'unknown',
        kind: (r && r.kind) || 'auto',
        score: (r && r.score != null) ? r.score : null,
        max: (r && r.max != null) ? r.max : null,
        detail: (r && r.detail) || {},
        artifact_url: (r && r.artifact_url) || null,
        spent_sec: Math.round((Date.now() - t0) / 1000)
      };
      var res;
      try {
        res = await sb.rpc('cw_submit', { p_bundle_id: cwb, p_item_id: cwi, p_payload: payload });
      } catch (e) {
        return { status: 'error', message: String(e && e.message || e) };
      }
      if (res && res.error) return { status: 'error', message: res.error.message };
      sent = true;
      return (res && res.data) || { status: 'ok' };
    },
    // 소요초만 리셋(재도전 후 재제출 대비) — 테스트/도구용
    _resetTimer: function () { t0 = Date.now(); sent = false; }
  };
})();
