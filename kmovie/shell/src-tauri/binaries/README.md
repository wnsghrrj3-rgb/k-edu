# ffmpeg 사이드카

여기에 Windows용 정적 빌드 두 개를 둔다 (레포엔 안 올린다, .gitignore):

- `ffmpeg-x86_64-pc-windows-msvc.exe`
- `ffprobe-x86_64-pc-windows-msvc.exe`

`..\..\scripts\get-ffmpeg.ps1` 을 PowerShell 에서 한 번 실행하면 gyan.dev `ffmpeg-release-essentials.zip` 을 받아
이름을 맞춰 넣고, 라이선스 문서를 `../LICENSE-ffmpeg.txt` 로 복사한다.
Tauri 가 빌드할 때 `ffmpeg.exe`·`ffprobe.exe` 로 exe 옆에 복사한다(껍데기는 exe 옆 → PATH 순으로 찾는다).

라이선스: 프록시의 H.264 인코딩이 libx264(GPL)라 이 빌드는 **GPL** 이다. ffmpeg 는 별도 프로세스로만 호출하고
설치본에 라이선스 전문과 소스 링크(ffmpeg.org · gyan.dev)를 함께 넣는다. 나중에 GPL 을 피하려면 `h264_mf`(Windows Media Foundation) 로 프록시를 만드는 LGPL 빌드로 바꿀 수 있다 — lib.rs 의 `-c:v libx264` 한 줄.
