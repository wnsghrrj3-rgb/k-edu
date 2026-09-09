# kmake/bake — 케이메이커 뒷공장 (블렌더 bpy)

무거운 3D(책상·종이·금테·도장·리본·빛·카메라)는 여기서 **한 번 굽고**, 결과(`../plates/`)를 정적 파일로 둔다.
교사·학생 브라우저는 블렌더도 서버도 없이 그 위에 글자만 얹는다(`../plates/award/`).

| 스크립트 | 산출 | 비고 |
|---|---|---|
| `hero_award.py` | `plates/award-wood-warm.mp4` · `.json`(프레임별 종이 모서리 px) · `.poster.png` | R142. 글자 없음 — 글자는 브라우저 몫 |

## 굽는 법
```
# 시험(CPU, 저화질)
python hero_award.py -- OUT --w 640 --h 360 --fps 12 --samples 8
# 원화질(준호 PC, 블렌더 설치)
blender -b -P hero_award.py -- OUT --w 1920 --h 1080 --fps 24 --samples 128
# 프레임 → mp4
ffmpeg -framerate 24 -i OUT/award-wood-warm_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart award-wood-warm.mp4
```
JSON 의 `corners[frame]` 은 렌더 해상도 기준 px 이므로, **해상도를 바꿔 구우면 JSON 도 같이 바꿔 올린다**(`--json-only` 로 0초).

원칙: 틀 하나 = 스크립트 하나. 판(대리석·크라프트)·분위기(시원)를 늘릴 땐 스크립트를 복제하지 말고 인자로.
