// K-edu Supabase 설정
// 이 파일은 .gitignore에 추가하지 않아도 됨 (anon key는 공개 안전)
// secret key는 절대 여기 넣지 말 것

// 인증 게이트 토글 — true: /grade*, /english/* 경로에서 무로그인 차단(/auth로 리다이렉트)
//                  false: 게이트 OFF (무로그인도 콘텐츠 접속 가능, 추적은 여전히 안 됨)
// 시범 base 작업·검증 중에는 false. 운영 복귀 시 true로 되돌릴 것.
const KEDU_AUTH_GATE = false;

const KEDU_SUPABASE_URL = 'https://fesxtgyhfpucazpenksp.supabase.co';
const KEDU_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3h0Z3loZnB1Y2F6cGVua3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjQzMDUsImV4cCI6MjA5MDg0MDMwNX0.H2HlS91yagFavrp70xz3QA5JodRcGOe3iUJWsR4An1g';

// 싱글턴 클라이언트 (중복 생성 방지)
let _keduDb = null;
function getKeduDb() {
  if (!_keduDb) {
    _keduDb = window.supabase.createClient(KEDU_SUPABASE_URL, KEDU_SUPABASE_ANON_KEY);
  }
  return _keduDb;
}
