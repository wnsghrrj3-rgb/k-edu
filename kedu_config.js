// K-edu Supabase 설정
// 이 파일은 .gitignore에 추가하지 않아도 됨 (anon key는 공개 안전)
// secret key는 절대 여기 넣지 말 것

const KEDU_SUPABASE_URL = 'https://fesxtgyhfpucazpenksp.supabase.co';
const KEDU_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3h0Z3loZnB1Y2F6cGVua3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjQzMDUsImV4cCI6MjA5MDg0MDMwNX0.H2HlS91yagFavrp70xz3QA5JodRcGOe3iUJWsR4An1g';

// Supabase 클라이언트 초기화 (CDN 사용 시)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// 위 스크립트 로드 후 아래 사용:
// const supabase = supabase.createClient(KEDU_SUPABASE_URL, KEDU_SUPABASE_ANON_KEY);
