# 케이무비 (KMovie) — K-edu 브라우저 영상 편집기

학교 홍보 영상용 컷 편집기. 설치 없이 Chrome에서 동작 (WebCodecs).

## 2단계 클립층 ✅
- 가져오기: mp4 (H.264/VP9/AV1 영상 + AAC/Opus 소리), 이미지. HEVC 미지원.
- 타임라인: V 단일 트랙(빈틈 없음), A1 연동/해제(J·L컷), 프리즈, 분할, 트림(리플), 이동, 스냅
- 속도: 정속/슬로/히트/랩스
- 재생: AudioContext 마스터 클럭
- 내보내기: MP4 (H.264 → VP9 폴백) + AAC 192k, 1920x1080 30fps
- 저장: IndexedDB 자동 저장/복원

## 3단계 룩·전환·자막 (현재)
- 룩 (`engine/look.js`): kmake/parts/lut/*.cube 3종 (fetch, 복사 0) — WebGL2 3D LUT 한 패스, 프로젝트 기본 + 클립 덮어쓰기, 강도, 노출 자동 맞춤(썸네일 통계 휴리스틱), 밝기·대비·채도, 비네트, 시네마 바(2.39:1), 켄 번즈 4종
- 전환 (`engine/transition.js`): 컷·디졸브·딥 투 블랙·딥 투 화이트·광누출(부품 p-lightleak)·스윕 와이프(금선)·휩 팬(4방향, 프레임 누적 블러). 길이 3 프리셋. 이전 클립은 out 너머 핸들 프레임(없으면 마지막 프레임)
- 자막 (`engine/subtitle.js`): S 레인 카드, 스타일 5종(방송 기본·박스·키커·다큐·팝), {강조} 표기(키커·팝), 두 줄 자동 줄바꿈, 150ms 페이드, 시네마 바 위로 자동 회피. 문장 목록 → A1 음성 구간 자동 분배(`KMV_AUDIO.voice()`), 타임라인에서 끌어 이동·트림
- 미리보기 = 내보내기 (같은 `KMV_RENDER.draw`/`drawExact`)

## 파일
- `index.html`, `kmovie.js` — UI·타임라인
- `engine/project.js` — 프로젝트 모델·편집 연산·undo
- `engine/media.js` — mp4box 디먹스 + VideoDecoder GOP 캐시 + 분석(썸네일·움직임·파형)
- `engine/audio.js` — 재생 클럭·A1 스케줄·오프라인 믹스
- `engine/look.js` — LUT·노출·켄 번즈·비네트·시네마 바 (WebGL2, CPU 폴백)
- `engine/transition.js` — 전환 7종
- `engine/subtitle.js` — 자막 스타일 5종·자동 분배
- `engine/render.js` — 프레임 렌더 (클립 → 룩 → 전환 → 자막 → 부품)
- `engine/export.js` — VideoEncoder/AudioEncoder + mp4-muxer

## 단축키
Space 재생 · S 분할 · F 프리즈 · Q/W 플레이헤드까지 트림 · N 스냅 · Del 삭제 · ←→(Shift 10f) · ↑↓ 클립 이동 · Home/End · Ctrl+Z/Y · =/- 줌 · Alt+드래그 A1 트림
