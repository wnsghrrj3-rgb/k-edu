# 케이무비 (KMovie) — K-edu 브라우저 영상 편집기

학교 홍보 영상용 컷 편집기. 설치 없이 Chrome에서 동작 (WebCodecs).

## 2단계 클립층 ✅
- 가져오기: mp4 (H.264/VP9/AV1 영상 + AAC/Opus 소리), 이미지. HEVC 미지원.
- 타임라인: V 단일 트랙(빈틈 없음), A1 연동/해제(J·L컷), 프리즈, 분할, 트림(리플), 이동, 스냅
- 속도: 정속/슬로/히트/랩스
- 재생: AudioContext 마스터 클럭
- 내보내기: MP4 (H.264 → VP9 폴백) + AAC 192k, 1920x1080 30fps
- 저장: IndexedDB 자동 저장/복원

## 3단계 룩·전환·자막 ✅
- 룩 (`engine/look.js`): kmake/parts/lut/*.cube 3종 (fetch, 복사 0) — WebGL2 3D LUT 한 패스, 프로젝트 기본 + 클립 덮어쓰기, 강도, 노출 자동 맞춤(썸네일 통계 휴리스틱), 밝기·대비·채도, 비네트, 시네마 바(2.39:1), 켄 번즈 4종
- 전환 (`engine/transition.js`): 컷·디졸브·딥 투 블랙·딥 투 화이트·광누출(부품 p-lightleak)·스윕 와이프(금선)·휩 팬(4방향, 프레임 누적 블러). 길이 3 프리셋. 이전 클립은 out 너머 핸들 프레임(없으면 마지막 프레임)
- 자막 (`engine/subtitle.js`): S 레인 카드, 스타일 5종(방송 기본·박스·키커·다큐·팝), {강조} 표기(키커·팝), 두 줄 자동 줄바꿈, 150ms 페이드, 시네마 바 위로 자동 회피. 문장 목록 → A1 음성 구간 자동 분배(`KMV_AUDIO.voice()`), 타임라인에서 끌어 이동·트림
- 미리보기 = 내보내기 (같은 `KMV_RENDER.draw`/`drawExact`)

## 4단계 부품 레인·인물 컷아웃·음악 (현재)
- 부품 P (`engine/parts.js`): kmake/parts 8종을 그대로 호출(복사 0). 목록 썸네일, 클릭=플레이헤드/끌기=P 레인 드롭, 필드 편집(파츠 계약), 홀드 늘이기(카드를 늘이면 등장·퇴장은 원속도, 가운데만 늘어남), 복제, 겹침 허용
- 인물 컷아웃 (`engine/seg.js`): "인물 뒤 흐르는 글자"는 부품 → 사람 컷아웃 순으로 합성. MediaPipe Selfie Segmentation 자체 호스팅(maker-playground/vendor/selfie-seg/, R134) 지연 로드, 프레임별 마스크 LRU 캐시, 켄 번즈 변환 동승. 카드별 "인물 뒤" 토글
- 음악 A2 (`engine/audio.js`·`media.js`): mp3·wav·m4a 가져오기 → A2 레인, 파형, 볼륨, 페이드 인/아웃 프리셋, 영상 끝 맞춤, 오토 덕킹(A1 음성 구간 -depth dB, 진입 200ms/복귀 500ms), 비트 마커(onset 휴리스틱) → 클립 경계 스냅
- 카드(S·P·A2) 공통 손맛: 끌어 이동·가장자리 트림·스냅·Del·undo
- 앰비언스 (`engine/audio.js` findRoomTone/ambGaps/scheduleAmb): 타임라인 원본에서 가장 조용한(무음 아닌) 1.5초 룸톤을 찾아 이음매 없는 루프로 만들고, A1 이 비는 구간(사진·프리즈·무음·볼륨 0)에 200ms 페이드로 깐다. 세기 3단(조용히/그대로/살짝 크게). A1 레인에 빗금 띠 "룸톤"
- 몽타주 깔기 (`engine/project.js` montage): 선택 클립부터 뒤 클립들(끝까지/4개/8개)의 길이를 A2 비트 격자(1·2·4박)에 맞춘다. 시작이 비트 위면 그 비트가 원점. 원본이 짧으면 있는 만큼만 쓰고 다음 클립이 격자 나머지를 채움. 구간은 "움직임 큰 곳"(motion 창 평균 최대) 또는 "지금 자리". 자동 컷 아님 — 순서·컷 수는 그대로, 길이만 박자 위로. Ctrl+Z 한 번에 원복

## 5단계 데스크톱 껍데기 (2026-08-28, 1차)
- `engine/shell.js` KMV_SHELL: `__TAURI__` 가 있을 때만 켜짐 — 경로 가져오기(껍데기 ffmpeg 프록시), 디스크 복원, 원화질 프레임(내보내기), 스트리밍 저장, 프록시 보관함. 브라우저에선 no-op.
- `shell/` Tauri 2 껍데기(Windows 1차). 자세한 건 `shell/README.md`.

## 파일
- `index.html`, `kmovie.js` — UI·타임라인
- `engine/shell.js` — 데스크톱 껍데기 접합점
- `engine/project.js` — 프로젝트 모델·편집 연산·undo
- `engine/media.js` — mp4box 디먹스 + VideoDecoder GOP 캐시 + 분석(썸네일·움직임·파형)
- `engine/audio.js` — 재생 클럭·A1 스케줄·오프라인 믹스
- `engine/look.js` — LUT·노출·켄 번즈·비네트·시네마 바 (WebGL2, CPU 폴백)
- `engine/transition.js` — 전환 7종
- `engine/subtitle.js` — 자막 스타일 5종·자동 분배
- `engine/parts.js` — 부품 메타·홀드 재매핑·썸네일
- `engine/seg.js` — 인물 컷아웃 마스크 (MediaPipe 자체 호스팅)
- `engine/render.js` — 프레임 렌더 (클립 → 룩 → 전환 → 인물 뒤 부품+컷아웃 → 자막 → 부품)
- `engine/export.js` — VideoEncoder/AudioEncoder + mp4-muxer

## 단축키
Space 재생 · S 분할 · F 프리즈 · Q/W 플레이헤드까지 트림 · N 스냅 · Del 삭제 · ←→(Shift 10f) · ↑↓ 클립 이동 · Home/End · Ctrl+Z/Y · =/- 줌 · Alt+드래그 A1 트림
