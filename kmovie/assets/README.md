# 케이무비 내장 음원 — 넣는 법 · 받는 곳

## 넣는 법 (3단계)
1. 곡을 받아 `kmovie/assets/music/<무드>/` 에 넣는다. 폴더 이름이 무드 이름이 된다(자유롭게 — 예: `잔잔`, `따뜻`, `활기`, `설렘`, `차분`, `웅장`, `엔딩`).
2. 효과음은 `kmovie/assets/sfx/<효과음 id>/` 에 넣는다. 폴더 이름이 합성 효과음 id 와 같으면 그 소리를 **실음원이 대신한다**(코드 수정 없음). 한 폴더에 여러 파일이면 자리마다 하나를 골라 쓴다.
3. `node kmovie/assets/scan.mjs` 를 돌리면 `library.json` 이 다시 만들어지고, 케이무비 「음악」 탭 「내장 음원」에 뜬다. 커밋·푸시하면 keduclass.com 에도.

- 형식: mp3 · wav · m4a · aac · ogg. 파일 이름이 제목이 된다(앞의 `01_` 같은 번호는 뗌).
- 출처·라이선스를 남기려면 같은 이름의 `.txt`(예: `아침 교실.mp3` → `아침 교실.txt`)에 `출처: …` `라이선스: …` 두 줄, 또는 폴더에 `_출처.txt` 하나(폴더 전체에 적용). 목록에 작게 표시된다.
- 곡이 30~40곡을 넘어가면 레포가 무거워지므로 그때는 Supabase Storage 로 옮긴다(URL 만 바꾸면 됨 — `engine/lib.js` BASE).

### 효과음 폴더 이름표 (합성 18종 id)
| 폴더 | 소리 | 어디에 자동으로 붙나 |
|---|---|---|
| `whooshShort` | 우시 짧게 | 밀기·덮기·닦기 전환 |
| `whooshLong` | 우시 길게 | 줌·휩 전환 |
| `riser` | 라이저 | (수동) |
| `impactLow` | 임팩트 낮게 | 뚫린 글자 |
| `impactSoft` | 임팩트 부드럽게 | 딥 전환·섹션 타이틀 |
| `subBoom` | 서브 붐 | 오프닝 |
| `lightSweep` | 빛 스윕 | 흰 딥·스윕·광누출 전환, 흐르는 글자 |
| `sparkle` | 반짝 | 글로우 전환, 금선 자막 |
| `ding` | 딩 | 인용구 |
| `typeTick` | 타자 틱 | 타자기 자막 |
| `paper` | 종이 넘김 | 챕터 |
| `click` | 클릭 | 목록, 설명 자막 |
| `popSoft` | 팝 부드럽게 | 하단 자막·태그, 띠 자막 |
| `filmRoll` | 필름 롤 | 광누출 부품 |
| `breath` | 숨 | 블러·루마 전환 |
| `cadence` | 잔향 종지 | 엔딩 크레딧 |
| `shutter` | 셔터 | (수동) |
| `countTick` | 카운트 틱 | 카운터 |

그 밖의 효과음(환경음·박수·종소리 등)은 아무 폴더 이름(예: `sfx/기타/`)에 넣으면 자동으로 붙진 않지만 목록에서 「＋」 로 음악 레인에 놓을 수 있다.

## 받는 곳 (상업 이용 가능 — 학교 홍보 영상·유튜브 게시 OK)

### 배경음악
| 곳 | 조건 | 메모 |
|---|---|---|
| **YouTube 오디오 보관함** (studio.youtube.com → 오디오 보관함) | 무료, 상업 이용 OK. 「저작자 표시 필요」 표시가 없는 곡은 표시도 불필요 | 가장 안전. 무드·장르·길이 필터. 금성초 영상 배경음악은 여기서 — 이미 결정 |
| **Pixabay Music** (pixabay.com/music) | Pixabay 라이선스 — 무료·상업 OK·표시 불필요 | 양이 많고 품질 고름. 「Cinematic / Corporate / Ambient」 태그 |
| **Free Music Archive** (freemusicarchive.org) | 곡마다 다름 — **CC BY** 또는 **CC0** 만 고를 것(BY-NC 는 상업 불가) | 검색 필터에서 라이선스 지정 |
| **Incompetech** (incompetech.com) | CC BY 4.0 — 영상 설명란에 "Music: Kevin MacLeod (incompetech.com)" 한 줄 | 잔잔한 피아노·오케스트라가 많음 |
| **Chosic** (chosic.com/free-music) | 곡마다 표시 — CC0/CC BY 필터 | 무드 검색이 편함 |
| **Uppbeat** (uppbeat.io) | 무료 계정: 월 3곡, 크레딧 한 줄 표시 | 요즘 감성. 유료 가입하면 표시 불필요 |

### 효과음
| 곳 | 조건 | 메모 |
|---|---|---|
| **Pixabay Sound Effects** (pixabay.com/sound-effects) | 무료·상업·표시 불필요 | whoosh, impact, click, riser 로 검색 |
| **Freesound** (freesound.org) | 소리마다 다름 — **CC0** 필터로만 | 양 최대. 회원가입 필요 |
| **Mixkit** (mixkit.co/free-sound-effects) | Mixkit 라이선스 — 무료·상업 OK | 깔끔한 UI 소리·전환음 |
| **Kenney** (kenney.nl/assets → Audio) | CC0 | 게임풍 팝·클릭 |
| **ZapSplat** (zapsplat.com) | 무료 계정은 표시 필요 | 양 많음 |

### 고를 때
- **BY-NC(비상업)·ND(변경 금지)** 는 피한다 — 편집해 홍보 영상에 쓰므로 둘 다 걸린다.
- 아이들 목소리와 겹치지 않게 **가사 없는 곡**, 보컬 없는 것.
- 60초 이상, 처음·끝이 조용히 시작·끝나는 곡이 페이드·덕킹에 좋다.
- 표시가 필요한 곡은 `.txt` 에 출처를 적어 두면 내보내기 뒤 설명란에 옮기기 쉽다.
