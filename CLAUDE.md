# K-edu (keduclass.com) — Claude Code 작업 규칙

준호(초등교사)가 혼자 만드는 K-edu. 2026-11-09부터 Claude Code(데스크톱)에서 이어 감.

## 폴더
- 작업 폴더 = `C:\Users\KST26\Desktop\지도서` (지도서 PDF·zip 들). **지도서 파일은 건드리지 않는다**(읽기만).
- 그 안에 `k-edu/`(이 저장소, github.com/wnsghrrj3-rgb/k-edu) · `handoff/`(github.com/wnsghrrj3-rgb/handoff).
- 지금 트랙 = **교과서판 2학기**. 현황판 = `handoff/STATUS-kedu-textbook2.md`. 짝 = `handoff/STATUS-kedu-worksheet.md`(허브·엔진 잠금) + `-g12`·`-g34`·`-g56`, `handoff/kedu/케이학습지_3종_설계_v2.md`.
- 시작할 때 handoff·k-edu 둘 다 `git pull`, 푸시 직전 `git pull --rebase`.

## 교과서판 작업 규칙 (준호 2026-11-09)
- 모든 교과서판 문항은 반드시 **지도서의 해당 단원을 직접 열어 읽고**, 그 내용을 근거로 만든다. 기존 문항이나 기억에 기대어 만들지 않는다.
- 해당 단원 지도서가 폴더에 없으면 만들지 말고 현황판에 「지도서 없음」으로 적고 다음 단원으로 넘어간다.
- 범위는 **2학기만**. 1학기는 이번에 하지 않는다.
- 현황판에 있는 2학기 단원 전부를, 모든 학년대에 걸쳐 **현황판 차례대로 단원 하나씩** 진행한다.
- 단원마다 순서: **케이학습지 → 케이티처 대조 → 대표 활동**. 이미 진행된 층은 건드리지 않는다.
- 기존 문항은 지우거나 덮지 않는다. 교과서와 다르게 지어 만든 기존 문항은 그대로 두고 교과서판(`tb_`)을 추가로 만든다(옛 세트는 「응용」 칸). 이미 교과서대로 된 부분은 손대지 않는다.
- 교과서 그림을 그대로 옮기지 말고, 교과서 곳곳의 자세한 내용과 활동을 빠짐없이 반영한다. 작가 작품(동시·동화) 본문은 몇 줄 인용까지만.
- 5-2·6-2 수학 지도서는 「공통자료」라고 적힌 파일이다. 1-2·2-2 수학 지도서는 zip(쪽 이미지).
- 교사 화면에 `u1`·`L01` 같은 영어 코드를 보이지 않게 말로 풀어 쓴다(「1단원」「2차시」).
- 단원 하나 끝날 때마다 점검(게이트) → k-edu와 handoff 둘 다 커밋·푸시, 현황판 갱신.
- 막히면 현황판에 적고 다음 단원으로 넘어간다. 준호 손이 필요한 일(SQL 실행 등)은 현황판 「✋ 준호 손 대기」 칸에 모은다.
- 준호에게 묻지 말고 끝까지 진행한다. 보고는 한 줄로, 단원은 「3단원」처럼 쓴다.
- 기준은 「아주 제대로 멋지게」. 양 늘리기보다 깊이 있고 다양한 문항.

## 교과서판 기술 메모
- 세트 이름 = `tb_` + 옛 접두(예 `tb_g2_2_math_u1_L02_basic`), kind 는 평소대로. 옛 세트 → `python3 kedu/worksheet/tools/tb_flip.py <접두> --write`.
- 검사: `FUZZ=200 node kedu/worksheet/tools/check_sets.js tb_<접두>` · `FUZZ=5` 전체(실패 0만 봄) · `tests/test_kedu_worksheet_apply.js` · build · report.
- 시드: `python3 kedu/worksheet/tools/sets_to_seed.py tb_<접두>` (+ 옛 접두 갈래 갱신).
- 지도서 글자본은 `handoff/지도서/<과목><학년-학기>_<N>단원_지도서_text.txt` 로 남겨 다음에 다시 뽑지 않게.
- 공용 엔진(play.html·check_sets.js·sets_to_seed.py·build.html·tests)을 고칠 때는 허브 「공용 엔진 잠금」 규칙.
