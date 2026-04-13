// =============================================
// K-edu 방문 추적 (kedu_tracker.js)
// 각 콘텐츠 페이지에 아래처럼 추가:
// <script src="/kedu_config.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="/kedu_tracker.js"></script>
// =============================================

(function(){
  // 중복 실행 방지
  if(window.__keduTracked) return;
  window.__keduTracked = true;

  // Supabase 준비 대기
  function track(){
    if(typeof window.supabase === 'undefined' ||
       typeof KEDU_SUPABASE_URL === 'undefined') {
      setTimeout(track, 200);
      return;
    }

    try {
      const client = window.supabase.createClient(KEDU_SUPABASE_URL, KEDU_SUPABASE_ANON_KEY);

      // 세션 ID (탭 단위, 같은 탭에서 재방문 시 동일)
      let sessionId = sessionStorage.getItem('kedu_session');
      if(!sessionId){
        sessionId = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
        sessionStorage.setItem('kedu_session', sessionId);
      }

      // 같은 페이지 중복 기록 방지 (세션 내 같은 페이지는 1회만)
      const pageKey = 'kedu_visited_' + location.pathname;
      if(sessionStorage.getItem(pageKey)) return;
      sessionStorage.setItem(pageKey, '1');

      // 방문 기록
      client.from('page_visits').insert({
        page_path: location.pathname,
        session_id: sessionId
      }).then(()=>{}).catch(()=>{});

    } catch(e){
      // 추적 실패해도 사용자 경험에 영향 없음
    }
  }

  // DOM 로드 후 실행
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', track);
  } else {
    track();
  }
})();
