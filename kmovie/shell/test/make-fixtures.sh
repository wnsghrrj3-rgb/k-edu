#!/bin/sh
# 합성 원본 3종: 25fps · 60fps · 시작 오프셋(1.478s) 30fps. 각 6초, 키프레임 1초마다.
set -e
D=${1:-/tmp/kmv-fixtures}; mkdir -p "$D"
mk() { ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=1920x1080:rate=$1" -f lavfi -i sine=frequency=440:sample_rate=48000 -t 6 -c:v libx264 -preset ultrafast -g "$1" -pix_fmt yuv420p -c:a aac -shortest $3 "$D/$2.mp4"; }
mk 25 orig25 ""; mk 60 orig60 ""; mk 30 orig30off "-output_ts_offset 1.5"
echo "$D"
