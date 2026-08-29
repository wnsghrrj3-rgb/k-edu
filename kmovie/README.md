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

## 6단계 컷 손맛 — 프리미어급 컷 도구 (2026-08-28)
- 소스 모니터: 미디어 보관함 클릭 → 스테이지가 소스로 (탭 「타임라인 | 소스」). 소스 바(필름스트립) 스크럽, Space·JKL 로 원본 소리 그대로 재생, I/O 로 구간 → `,` 삽입(플레이헤드에서 뒤를 밀며) · `.` 덮어쓰기(그 길이만큼) · 「끝에」. I/O 는 원본마다 기억. 보관함 ＋ 는 통째로 끝에.
- 슬립(Alt+몸통 끌기): 자리·길이 그대로, 원본 구간만 민다. 두 화면 미리보기(시작·끝).
- 롤(Ctrl+가장자리 끌기): 편집점 하나만 — 앞 out·뒤 in 이 같이, 전체 길이 그대로. 두 화면 미리보기(앞 끝·뒤 시작). 스냅 됨.
- 슬라이드(Ctrl+Alt+몸통 끌기): 클립의 내용·길이는 그대로, 타임라인 자리만 민다 — 앞 out·뒤 in 이 받아 전체 길이 그대로. 양옆에 클립이 있어야 한다. 두 화면 미리보기(앞 끝·뒤 시작).
- 리프트(;): 선택 클립을 같은 길이의 「빈 자리」(검은 화면)로 — 뒤 클립은 밀리지 않는다. 빈 자리도 V 의 클립이라 빈틈 없음 불변식 그대로, 잇닿으면 하나로 합친다. 길이 조절·롤·분할·삭제 가능. 익스트랙트('): 당겨서 지우기(리플 — Del 과 같지만 프리미어 손가락 그대로).
- 라쏘(Shift+빈 곳 드래그): 상자를 그려 V 클립 다중 선택.
- 다중 선택: Shift+클릭 범위 · Ctrl+클릭 토글 · Ctrl+A. 묶음 이동(순서 유지)·Del·Ctrl+C/X/V(플레이헤드에 삽입, A1 볼륨·J/L 동반).
- 마커: M 놓기(같은 자리 M = 이름), Shift+M 다음 · Ctrl+Shift+M 이전, 눈금자에서 끌어 이동·더블클릭 이름·Del. 스냅 후보. 프로젝트 패널에 목록.
- JKL 셔틀: L 1×(소리) → 2× → 4×, J 역방향 1×/2×/4× (2× 이상·역방향은 무음 프레임 스텝), K 정지.
- 모델(`engine/project.js`): slip · roll · insertRange(insert/overwrite/append) · removeClips · moveClips · copyClips/pasteClips · markers. `KMV_AUDIO.playSource`.
- 검증: `test/model-cut.test.mjs`(node 51) · `test/ui-cut.mjs`(playwright headless 61, VP9 합성 원본).

## 재생 성능 (2026-08-28, 실촬영본 끊김 수정)
실촬영 52분 타임라인에서 재생 불가 수준 끊김 → 원인 3개 수정:
- 재생 스트림(`media.js streamTo`): 재생·앞셔틀 중엔 GOP 통 디코드+flush 대신 플레이헤드를 앞서가는 순차 디코드(파일 끝에서만 flush). 컷 경계 1초 전 다음 클립 예열. 정지·스크럽은 기존 getFrame.
- 분석 일시정지(`setAnalyzePaused`): 재생·셔틀 중엔 백그라운드 분석(전 프레임 디코드)이 쉼 — 디코더 경쟁 제거.
- 재생 중 미리보기 1/2 해상도: 캔버스 백킹만 960×540 (LUT 업로드·합성 4배 절감), 멈추면 원본 화질 복귀. 내보내기는 그대로 원본 해상도.
- 4K급(>2.2MP) 원본은 프레임 캐시 60으로 축소 (VideoFrame 메모리).
검증: `test/ui-play-perf.mjs` — 1080p60 원본에서 구버전 headless 0fps(정지) 재현, 수정판은 진행·반해상도 전환/복귀·분석 일시정지/재개·픽셀 일치 통과.

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
Space 재생 · J/K/L 셔틀 · S 분할 · F 프리즈 · Q/W 플레이헤드까지 트림 · N 스냅 · Del 삭제 · ←→(Shift 10f) · ↑↓ 편집점 · Home/End · Ctrl+Z/Y · Ctrl+A/C/X/V · M 마커(Shift+M 다음·Ctrl+Shift+M 이전) · I/O 소스 구간 · , 삽입 · . 덮어쓰기 · Esc 타임라인 · =/- 줌 · Alt+드래그 A1 트림 · Alt+몸통 슬립 · Ctrl+가장자리 롤 · Ctrl+Alt+몸통 슬라이드 · ; 리프트 · ' 익스트랙트 · Shift/Ctrl+클릭·Shift+빈 곳 드래그(라쏘) 다중 선택
