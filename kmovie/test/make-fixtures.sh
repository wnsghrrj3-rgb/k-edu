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
# ui-lazy.mjs 용: 조각(fragmented) mp4 — moov 에 샘플 표가 없어 지연 디먹스가 통 읽기로 폴백해야 하는 구조
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=320x180:rate=30:duration=2" -f lavfi -i "sine=frequency=440:duration=2" -c:v libvpx-vp9 -b:v 200k -cpu-used 5 -g 15 -c:a libopus -pix_fmt yuv420p -movflags frag_keyframe+empty_moov fx/frag.mp4
# ui-stab.mjs 용: 흔들리는 원본 — 정지 그림 위에서 잘라내는 창을 프레임마다 흔든다(손떨림 흉내).
# 그림 자체는 안 움직이므로 "재어야 할 이동량"의 정답을 알고 있다: 창이 움직인 만큼의 반대.
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=1280x720" -frames:v 1 fx/still.png
ffmpeg -hide_banner -loglevel error -y -loop 1 -framerate 30 -t 4 -i fx/still.png \
  -vf "crop=640:360:x='320+30*sin(2*PI*n/5)':y='180+24*sin(2*PI*n/7)'" \
  -c:v libvpx-vp9 -b:v 1200k -cpu-used 5 -row-mt 1 -g 30 -pix_fmt yuv420p -r 30 fx/shake.mp4
# ui-hevc.mjs 용: HEVC(hvc1) 3초 — 디먹스가 hvcC 로 description 을 만들고 isConfigSupported 에 맡기는지 (HW 디코더 없는 환경은 새 안내로 거절)
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=640x360:rate=30:duration=3" -f lavfi -i "sine=frequency=440:duration=3" -c:v libx265 -tag:v hvc1 -x265-params log-level=none -g 15 -c:a aac -b:a 96k -pix_fmt yuv420p fx/hevc.mp4
