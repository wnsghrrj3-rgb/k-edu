#!/bin/bash
# ui-cut.mjs 용 합성 원본 2개 (VP9/opus mp4, 6초 30fps) — headless chromium 에는 H.264 디코더가 없어 VP9 로
cd "$(dirname "$0")" && mkdir -p fx
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=640x360:rate=30:duration=6" -f lavfi -i "sine=frequency=440:duration=6" -c:v libvpx-vp9 -b:v 600k -g 15 -c:a libopus -pix_fmt yuv420p fx/a.mp4
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "smptebars=size=640x360:rate=30:duration=6" -f lavfi -i "sine=frequency=660:duration=6" -c:v libvpx-vp9 -b:v 600k -g 15 -c:a libopus -pix_fmt yuv420p fx/b.mp4
ls -la fx
