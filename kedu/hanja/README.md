# 한자 획순 자산 (아침활동)

- `hanzi-writer.min.js` — 획순 애니메이션·따라쓰기 채점 엔진.
  [Hanzi Writer](https://github.com/chanind/hanzi-writer), **MIT License**.
- `strokes/{한자}.json` — 글자별 획 경로(strokes)와 획 중심선(medians).
  [Make Me A Hanzi](https://github.com/skishore/makemeahanzi) 에서 온 자료로,
  Arphic Technology 가 1999년 공개한 글꼴에서 추출됐다.
  **Arphic Public License** (사본: `ARPHICPL.TXT`) 아래 재배포·수정할 수 있다.
- `MISSING.json` — 획순 자료가 없는 글자 목록.

## 왜 CDN 대신 자체 호스팅인가
학교망에서 외부 CDN이 막히는 일이 잦다. 전체 396자 합계 약 0.96MB이고
글자당 평균 2KB라, 필요한 글자만 그때그때 불러오면 부담이 없다.

## 누락 글자 처리
한국에서 쓰는 정자(正字) 4자에 자료가 없다 — 敎 · 飮 · 窓 · 淸.
통용 이체자(教·飲·窗·清)는 자료가 있지만 **획순을 대신 보여주지 않는다.**
셋은 모양이 거의 같아도 窓/窗 은 아래 心 이 있고 없고가 달라 획수 자체가 다르다.
학생에게 다른 글자의 획순을 가르치는 쪽이 자료가 없다고 말하는 쪽보다 나쁘다.
→ 화면은 "획순 자료 준비 중"으로 정직하게 비우고, 나머지 기능(뜻·낱말)은 그대로 쓴다.
이 4자는 손으로 획 경로를 그려 넣으면 해결된다(남은 일).
