# K-Maker 가져오기 계약

본 문서는 통합을 위한 계약입니다. K-Maker 실제 저장 스키마나 API를 확인하지 않았으므로 현재 importer에 바로 들어간다고 보장하지 않습니다. 제품 수정은 이번 작업 범위에 없습니다.

## 기존 패키지와의 연결

크리스마스 프레임의 `kedu.editable-svg-asset/1.0`이 사용하던 안정적인 ID, rootGroupId, canvas, zIndex와 독립 객체 철학을 유지했습니다. 이번 `kedu.editable-template/1.0`은 혼합 객체를 표현하기 위한 새 계약입니다. SVG 재귀 파싱보다 template.json을 우선 사용하세요.

| 원본 | K-Maker 대상 객체 | 유지할 정보 |
|---|---|---|
| type=text | 네이티브 Text | text, fontFamily, fontSize, fontWeight, fill, textAlign, letterSpacing, lineHeight |
| role=photo-slot | 네이티브 Image / Photo Placeholder | src, 프레임 좌표, crop, fit, 교체 동작 |
| type=shape | 네이티브 Shape | rect / ellipse, fill, stroke, strokeWidth |
| type=vector | Path 또는 편집 가능한 벡터 그룹 | paths 배열의 d, fill, stroke, strokeWidth, viewBox |

사진 슬롯은 의미적으로 Photo Placeholder이며 단순 배경 도형으로만 가져오면 안 됩니다. path 배열을 이미지 URL로 치환하지 않습니다. asset 파일은 교환용이며 JSON의 paths가 편집본의 권위 있는 값입니다.

## 좌표 및 글자

- 캔버스 좌상단 (0,0), 단위는 논리 px. width=3000, height=1000.
- 객체 x/y는 좌상단, 회전 중심은 객체 중앙. opacity 0–1.
- 텍스트 fontSize·letterSpacing은 px, lineHeight는 글꼴 크기에 대한 배수.
- 명시적인 `\n`으로 행 분리. 기본 자동 줄바꿈 없음. 첫 행 기준선 y=fontSize×0.83, 이후 행 기준선 간격 fontSize×lineHeight.
- 좌·중·우 정렬은 각 텍스트 상자의 0, width/2, width에 기준점을 둠.
- 정확한 재현에는 동봉 폰트 로드 후 레이아웃 필요. 폰트를 곡선화하지 않을 것.
- Vector local path 좌표는 viewBox 기준. 표시 시 width/viewBox[2], height/viewBox[3] 비례 배율 적용.
- objects 배열은 뒤→앞 순서이며 zIndex와 동일. rootGroupId는 전체 선택 그룹. parentId는 논리적 슬롯 소유 관계이지 이중 변환할 로컬 좌표가 아님.

## 사진 교체와 크롭

1. role=photo-slot인 객체를 생성하고 slot ID에 연결된 fallbackFor 객체를 같은 프레임에 클립.
2. src가 없으면 fallback 풍경을 표시. src가 있으면 fallback 객체들은 보존한 채 렌더링만 숨김.
3. src는 상대 파일 경로나 data URL. 편집 확인 도구는 업로드 사진을 data URL로 저장.
4. 사진 자연 크기 Iw,Ih, 프레임 Fw,Fh일 때 s=max(Fw/Iw,Fh/Ih)×max(1,zoom).
5. 표시 크기 Dw=Iw×s, Dh=Ih×s. 위치는 ((Fw-Dw)/2+offsetX,(Fh-Dh)/2+offsetY).
6. offsetX는 ±(Dw-Fw)/2, offsetY는 ±(Dh-Fh)/2 범위로 렌더링 시 제한. 프레임 rect에 클립.
7. 회전은 프레임 중심 기준으로 사진 및 기본 풍경에 적용.
8. 슬롯 삭제 시 해당 fallbackFor 객체를 함께 삭제. 일반 장식 삭제는 다른 객체에 영향 없음.
9. 사진 슬롯 복제 시 ID, fallbackFor/parentId 참조와 하위 path ID를 모두 새로 생성.

## 전체 확대

목표 폭 W일 때 r=W/현재 폭, 높이도 r 적용. 모든 x/y/width/height/fontSize/letterSpacing/strokeWidth 및 crop offset을 r배 합니다. paths 좌표·viewBox는 그대로 두고 표시 크기로 배율을 결정합니다. lineHeight, opacity, rotation, crop zoom은 유지합니다. 실제 물리 출력 크기는 별도 설정하세요.

## 통합 완료 판정

제목이 네이티브 Text로 선택되는지, 사진 교체 후 다른 객체들이 살아 있는지, 나무 1개만 이동/삭제되는지, 저장 후 재열기에서 동일한지 확인해야 합니다. 이 패키지의 오프라인 확인 결과와 K-Maker 실제 importer 검증은 구분합니다.
