# 케이무비 껍데기용 ffmpeg 사이드카 받기 (Windows PowerShell 5+)
#   PS> .\scripts\get-ffmpeg.ps1          # GPL 빌드(gyan, libx264 — 화질·속도 최선)
#   PS> .\scripts\get-ffmpeg.ps1 -Lgpl    # LGPL 빌드(BtbN — 프록시는 h264_mf 로 자동 인코드)
param([switch]$Lgpl)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$bin  = Join-Path $root 'src-tauri\binaries'
$tmp  = Join-Path $env:TEMP 'kmovie-ffmpeg'
New-Item -ItemType Directory -Force -Path $bin, $tmp | Out-Null
$zip = Join-Path $tmp 'ffmpeg.zip'
if ($Lgpl) {
  Write-Host '→ BtbN ffmpeg LGPL 빌드 받는 중… (libx264 없음 — 프록시는 h264_mf 자동 선택)'
  Invoke-WebRequest -Uri 'https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-lgpl.zip' -OutFile $zip
} else {
  Write-Host '→ gyan.dev ffmpeg-release-essentials.zip 받는 중… (GPL — libx264)'
  Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile $zip
}
Write-Host '→ 푸는 중…'
Expand-Archive -Force -Path $zip -DestinationPath $tmp
$dir = Get-ChildItem -Directory $tmp | Where-Object { $_.Name -like 'ffmpeg-*' } | Select-Object -First 1
Copy-Item (Join-Path $dir.FullName 'bin\ffmpeg.exe')  (Join-Path $bin 'ffmpeg-x86_64-pc-windows-msvc.exe')  -Force
Copy-Item (Join-Path $dir.FullName 'bin\ffprobe.exe') (Join-Path $bin 'ffprobe-x86_64-pc-windows-msvc.exe') -Force
$lic = Get-ChildItem $dir.FullName -Recurse -Include 'LICENSE*','COPYING*' | Select-Object -First 1
if ($lic) { Copy-Item $lic.FullName (Join-Path $root 'src-tauri\LICENSE-ffmpeg.txt') -Force }
& (Join-Path $bin 'ffmpeg-x86_64-pc-windows-msvc.exe') -version | Select-Object -First 1
Write-Host '완료 — src-tauri\binaries\ 에 ffmpeg·ffprobe 가 들어갔어요.'
