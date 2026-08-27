# 케이무비 데스크톱 껍데기 (Tauri 2 · Windows 1차)

브라우저판(keduclass.com/kmovie/)이 알맹이. 이 껍데기는 창 하나로 그 주소를 열고, 옆에 ffmpeg 를 붙여
**무거운 원본(HEVC·4K·긴 파일) → 프록시**, **내보내기는 원본 화질** 을 해 준다. 편집 로직은 한 줄도 없다.
설계: handoff `kmovie/케이무비_데스크톱_껍데기_설계_v1.md`.

## 하는 일 4가지
1. **접속 게이트** — 시작 시 keduclass.com:443 접속 확인 → 되면 사이트, 안 되면 `ui/offline.html`(다시 시도). 로그인·권한은 사이트 정책 그대로.
2. **원본 받기** — 파일 선택/끌어놓기(경로) → ffprobe 로 프레임 표 → ffmpeg 프록시(긴 변 1280·30fps·H.264 baseline·GOP 15·AAC 128k) → 조각으로 웹에 전달 → 브라우저판 `KMV_MEDIA.open` 그대로. 사진·음악은 원본 그대로.
3. **원본 연결 유지** — media.origin `{ path, hash, … }`. 프록시는 `%LOCALAPPDATA%\KMovie\proxy\<hash>.mp4` + `.json`(프레임 표). 새로고침 복원은 IndexedDB 대신 이 프록시. 30일 안 쓰면 자동 정리, 화면 "프로젝트" 칸에서 폴더 열기·비우기.
4. **원화질 렌더** — 내보내기 때 `drawExact` 가 프록시 프레임 번호 idx 와 **같은 프레임**을 원본에서 1920×1080 RGBA(레터박스)로 받는다(`frame_next`). 순서대로 읽고, 뒤로 가거나 90프레임 넘게 건너뛰면 키프레임으로 다시 seek. 저장은 mp4-muxer StreamTarget → 껍데기 위치 쓰기(메모리 0).

## 프레임 정렬 규칙 (검증됨 — `test/frame-map.mjs`)
- 프록시: `-vf scale…,fps=30 -fps_mode passthrough`. 원화질 파이프: `-ss (키프레임초-0.002) -copyts -start_at_zero -i 원본 -vf fps=30,scale…,pad… -fps_mode passthrough -f rawvideo`.
- 슬롯 = ffmpeg 와 같은 정수 반올림(`av_rescale_q_rnd NEAR_INF`), format.start_time 오프셋까지 동일. seek 는 목표 슬롯보다 **작은** 슬롯의 마지막 키프레임에서 시작해 그 키프레임 슬롯은 버린다(60fps 원본의 같은 슬롯 경쟁까지 일치).
- 25fps·60fps·시작 오프셋 1.478s 원본, seek 앞뒤 8지점 × 3파일 = 24/24 픽셀 일치.

## 빌드 (준호 Windows PC)
```
# 1) 준비: Rust(rustup) · Node 18+ · Tauri CLI
npm i -g @tauri-apps/cli
# 2) ffmpeg 사이드카 (한 번만)
powershell -ExecutionPolicy Bypass -File scripts\get-ffmpeg.ps1
# 3) 개발 실행 / 설치 파일
cd src-tauri && cargo tauri dev
cd src-tauri && cargo tauri build      # → target\release\bundle\nsis\KMovie_0.1.0_x64-setup.exe
```
- 첫 빌드는 Tauri 의존성 컴파일로 10분 안팎. **이 Rust 코드는 아직 컴파일해 본 적 없다**(작성 환경에 cargo 없음) — 첫 `cargo tauri dev` 에서 오탈자를 잡는다. 규칙 자체는 `test/mock-backend.mjs`(같은 프로토콜의 Node 판)로 검증했다.
- 설치는 현재 사용자 범위(관리자 불필요). 서명 없음 → SmartScreen "추가 정보 → 실행" 안내 필요.
- WebView2(엣지) 가 없는 아주 오래된 Windows 은 설치 시 Tauri 가 부트스트랩을 안내한다.

## 테스트 (리눅스/맥, ffmpeg 필요)
```
sh test/make-fixtures.sh /tmp/kmv-fixtures
D=/tmp/kmv-fixtures node test/frame-map.mjs   # 프레임 정렬 24/24 + 조각 읽기
D=/tmp/kmv-fixtures node test/shell-js.mjs    # engine/shell.js ↔ mock 백엔드
```

## 파일
- `src-tauri/src/lib.rs` — 커맨드 14개(shell_info · pick_files · import_path · read_chunk · proxy_check · frame_next · frame_close · export_open/write/close · cache_info/clear · open_cache_dir · retry_online)
- `src-tauri/tauri.conf.json` · `capabilities/default.json`(keduclass.com 원격 IPC 허용) · `icons/`(네이비·금선·K) · `binaries/`(사이드카, 레포 제외)
- `ui/offline.html` — 접속 안 될 때 화면
- 브라우저판 접합: `../engine/shell.js`(KMV_SHELL) — `__TAURI__` 없으면 전부 no-op

## 정직 기록
- ffmpeg 빌드는 GPL(libx264). 별도 프로세스 호출 + 라이선스 전문 동봉. LGPL 로 가려면 `h264_mf` 로 프록시 인코더 교체.
- 원본 상한 15분(프록시 샘플과 PCM 이 브라우저 메모리에 다 올라감). 그보다 길면 폰에서 잘라 넣기.
- 원본이 VFR(폰 가변 프레임) 이어도 두 파이프가 같은 규칙이라 정렬은 유지되지만, 실제 폰 HEVC 원본은 아직 안 돌려 봤다.
