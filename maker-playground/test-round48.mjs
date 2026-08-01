/* R48 — 미리보기 실재생 배선 + 케이에듀 생태계 공유 검증 */
import fs from 'fs';

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const src = fs.readFileSync('screens/workspace.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const boxbar = fs.readFileSync('/kedu_boxbar.js', 'utf8');

/* ---- ① 미리보기 ---- */
T('미리보기 — MK_PLAY.open 실재생 배선 (#/editor R37 동일)', () => {
  A(src.includes("window.MK_PLAY.open(doc(), { startIdx: 0 })"), 'MK_PLAY 배선');
});
T('미리보기 — 정적 썸네일 가짜 모달 제거', () => {
  A(!src.includes('전체 재생 미리보기는 후속 단계'), '가짜 모달 잔존');
});
T('미리보기 — 엔진 부재 시 정직 안내', () => {
  A(src.includes('재생 엔진이 로드되지 않았어요'), '폴백 안내');
});

/* ---- ② 공유 ---- */
T('공유 — 케이박스 「바로 초대」 버튼 연결', () => {
  A(src.includes('우리 반에 바로 초대 (케이박스)'), '초대 버튼');
  A(src.includes('window.KeduBoxbar.openPanel()'), 'openPanel 호출');
});
T('공유 — KEDU_BOXBAR_CTX로 kmake 컨텍스트 주입', () => {
  A(src.includes("kind: 'kmake'") && src.includes("'케이메이커: ' + (doc().title"), 'CTX 주입');
});
T('공유 — 박스바 미탑재/비교사 시 disabled + 정직 안내', () => {
  A(src.includes("document.querySelector('.kbx-fab')"), '실존재 판정');
  A(src.includes('교사 로그인 상태의 케이에듀에서 열면 활성화돼요'), '안내');
});
T('공유 — 링크 복사 (clipboard·비지원 폴백)', () => {
  A(src.includes('navigator.clipboard.writeText'), 'clipboard');
  A(src.includes("location.origin + '/maker-playground/'"), 'URL');
});
T('공유 — 서버 저장 필요 정직 안내 (작업물 링크 공유 미지원 명시)', () => {
  A(src.includes('서버 저장(후속)이 필요해요'), '정직 안내');
});
T('index.html — 케이박스바 스크립트 탑재', () => {
  A(html.includes('<script src="/kedu_boxbar.js"></script>'), '스크립트 태그');
});

/* ---- 박스바 계약 정합 (우리가 의존하는 공개 API·규약이 실존하는지) ---- */
T('박스바 계약 — openPanel 공개 API 실존', () => {
  A(boxbar.includes('openPanel: openPanel'), 'openPanel 공개');
});
T('박스바 계약 — KEDU_BOXBAR_CTX 우선 규약 실존', () => {
  A(boxbar.includes('window.KEDU_BOXBAR_CTX'), 'CTX 훅');
});
T('박스바 계약 — kmake kind·라벨·색 등록됨', () => {
  A(boxbar.includes("kmake: '케이메이커'") && boxbar.includes("kmake: '#5B8EF8'"), 'kind 등록');
});
T('박스바 계약 — 학생 기기 no-op 부팅 규약 (캐시 없으면 아무것도 안 함)', () => {
  A(boxbar.includes('캐시 있으면 바 표시') || boxbar.includes('학생 기기 no-op'), '부팅 규약');
});

console.log(`\nR48: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
