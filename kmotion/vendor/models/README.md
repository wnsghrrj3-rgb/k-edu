# 케이모션 모델 자체 호스팅 자리 (엔진 0.7.0 `opt.modelBase`)

학교망이 storage.googleapis.com 을 막을 때를 대비한 자리. 아래 파일 이름 그대로 이 폴더에 두면
`KMotion.create({ ..., modelBase: '/kmotion/vendor/models/' })` 가 여기서 먼저 읽고, 없으면 구글 주소로 넘어간다.

| 파일 | 원래 주소 |
|---|---|
| hand_landmarker.task | https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task |
| pose_landmarker_lite.task | https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task |
| selfie_segmenter.tflite | https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite |

베프 컨테이너는 구글 스토리지에 못 붙어서 아직 비어 있음 — 준호 브라우저로 받아 이 폴더에 올리면 됨(Apache-2.0).
