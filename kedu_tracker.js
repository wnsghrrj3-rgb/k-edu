// =============================================
// K-edu 방문 추적 + 인증 가드 (kedu_tracker.js)
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
  function init(){
    if(typeof window.supabase === 'undefined' ||
       typeof getKeduDb === 'undefined') {
      setTimeout(init, 200);
      return;
    }

    try {
      const client = getKeduDb();
      const path = location.pathname;

      // ==========================================
      // 보호 경로 체크 (로그인 필요)
      // /grade1~6/... 또는 /english/... 의 하위 콘텐츠
      // ==========================================
      const PROTECTED = /^\/(grade[1-6]|english)\/.+/;

      if(PROTECTED.test(path)){
        // 비동기 세션 체크
        client.auth.getSession().then(function(result){
          var session = result.data.session;
          if(!session){
            // 미로그인 → /auth/ 로 리다이렉트 (현재 URL 보존)
            var returnUrl = encodeURIComponent(location.href);
            location.replace('/auth/?redirect=' + returnUrl);
            return;
          }
          // 로그인 상태 → last_seen_at 업데이트 (실패해도 무시)
          client.from('student_profiles')
            .update({ last_seen_at: new Date().toISOString() })
            .eq('user_id', session.user.id)
            .then(function(){}).catch(function(){});
        });
      }

      // ==========================================
      // 방문 추적 (모든 페이지, 보호 여부 무관)
      // ==========================================

      // 세션 ID (탭 단위)
      var sessionId = sessionStorage.getItem('kedu_session');
      if(!sessionId){
        sessionId = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
        sessionStorage.setItem('kedu_session', sessionId);
      }

      // 같은 페이지 중복 기록 방지
      var pageKey = 'kedu_visited_' + path;
      if(sessionStorage.getItem(pageKey)) return;
      sessionStorage.setItem(pageKey, '1');

      // 방문 기록 (로그인 사용자면 user_id도 포함)
      client.auth.getSession().then(function(result){
        var userId = result.data.session ? result.data.session.user.id : null;
        client.from('page_visits').insert({
          page_path: path,
          session_id: sessionId,
          user_id: userId
        }).then(function(){}).catch(function(){});
      });

    } catch(e){
      // 추적 실패해도 사용자 경험에 영향 없음
    }
  }

  // DOM 로드 후 실행
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
