#!/bin/bash
# ui-cut.mjs 용 합성 원본 2개 (VP9/opus mp4, 6초 30fps) — headless chromium 에는 H.264 디코더가 없어 VP9 로
cd "$(dirname "$0")" && mkdir -p fx
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=640x360:rate=30:duration=6" -f lavfi -i "sine=frequency=440:duration=6" -c:v libvpx-vp9 -b:v 600k -g 15 -c:a libopus -pix_fmt yuv420p fx/a.mp4
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "smptebars=size=640x360:rate=30:duration=6" -f lavfi -i "sine=frequency=660:duration=6" -c:v libvpx-vp9 -b:v 600k -g 15 -c:a libopus -pix_fmt yuv420p fx/b.mp4
ls -la fx
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=1920x1080:rate=60:duration=12" -f lavfi -i "sine=frequency=440:duration=12" -c:v libvpx-vp9 -b:v 2M -cpu-used 5 -row-mt 1 -g 30 -c:a libopus -pix_fmt yuv420p -movflags +faststart fx/big.mp4
ls -la fx
# ui-audio.mjs 용: 30초 VP9/opus 사인 440 (스트리밍 소리 창·청크 경계 검증)
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=320x180:rate=30:duration=30" -f lavfi -i "sine=frequency=440:duration=30" -c:v libvpx-vp9 -b:v 300k -cpu-used 5 -g 15 -c:a libopus -pix_fmt yuv420p fx/au.mp4
# ui-audio.mjs 용(AAC 디코더 있는 환경): H.264/AAC, t=2.0s 에 1kHz 클릭 + 낮은 220Hz 바닥 — elst 프라이밍·싱크 검증
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=320x180:rate=30:duration=10" -f lavfi -i "aevalsrc=if(between(t\,2\,2.01)\,0.9*sin(2*PI*1000*t)\,0.05*sin(2*PI*220*t)):s=48000:d=10" -c:v libx264 -profile:v baseline -g 15 -c:a aac -b:a 128k -pix_fmt yuv420p fx/aac.mp4
