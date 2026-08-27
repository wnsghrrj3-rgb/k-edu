# 케이무비 (KMovie) — K-edu 브라우저 영상 편집기

학교 홍보 영상용 컷 편집기. 설치 없이 Chrome에서 동작 (WebCodecs).

## 2단계 클립층 (현재)
- 가져오기: mp4 (H.264/VP9/AV1 영상 + AAC/Opus 소리), 이미지. HEVC 미지원.
- 타임라인: V 단일 트랙(빈틈 없음), A1 연동/해제(J·L컷), 프리즈, 분할, 트림(리플), 이동, 스냅
- 속도: 정속/슬로/히트/랩스
- 재생: AudioContext 마스터 클럭
- 내보내기: MP4 (H.264 → VP9 폴백) + AAC 192k, 1920x1080 30fps
- 저장: IndexedDB 자동 저장/복원

## 파일
- `index.html`, `kmovie.js` — UI·타임라인
- `engine/project.js` — 프로젝트 모델·편집 연산·undo
- `engine/media.js` — mp4box 디먹스 + VideoDecoder GOP 캐시 + 분석(썸네일·움직임·파형)
- `engine/audio.js` — 재생 클럭·A1 스케줄·오프라인 믹스
- `engine/render.js` — 프레임 렌더 (룩·전환·자막 슬롯)
- `engine/export.js` — VideoEncoder/AudioEncoder + mp4-muxer

## 단축키
Space 재생 · S 분할 · F 프리즈 · Q/W 플레이헤드까지 트림 · N 스냅 · Del 삭제 · ←→(Shift 10f) · ↑↓ 클립 이동 · Home/End · Ctrl+Z/Y · =/- 줌 · Alt+드래그 A1 트림
