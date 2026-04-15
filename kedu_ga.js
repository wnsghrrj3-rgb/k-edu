// =============================================
// K-edu Google Analytics 4 설정
// GA4 측정 ID를 아래에 입력하세요
// Google Analytics → 관리 → 데이터 스트림 → 측정 ID 복사
// =============================================

const KEDU_GA_ID = 'G-XXXXXXXXXX'; // ← 여기에 실제 GA4 측정 ID 입력

// GA4 스크립트 동적 로드
(function(){
  if(KEDU_GA_ID === 'G-XXXXXXXXXX') return; // ID 미설정 시 로드 안 함

  // gtag.js 로드
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + KEDU_GA_ID;
  document.head.appendChild(s);

  // gtag 초기화
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', KEDU_GA_ID, {
    page_title: document.title,
    page_location: location.href,
    // 한국 시간대 기준
    // 쿠키 설정 (GDPR 불필요 - 한국 서비스)
    cookie_flags: 'SameSite=None;Secure'
  });
})();
