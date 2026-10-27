# 이벤트 계약 v1 — 표현 층이 받는 「일어났다」 알림

> 정본: 13 문서 3-3절. 스킨은 소리·이펙트·연출만 한다. **모르는 이벤트는 무시**(오류 아님) — 시스템이 앞서가도 스킨이 깨지지 않는다.
> 모든 이벤트는 `{ type, ...필드 }`. 위치는 미터.

| type | 필드 | 표현 예 |
|---|---|---|
| `attack:fire` | uid, from, dir, power, side | 지팡이 끝 섬광, 「퓽」 |
| `spell:charge` | spell, ratio, pos | 충전 고리 시작 |
| `spell:cast` | spell, uid, pos, dir | 시전 폭발·발사음 |
| `spell:impact` | spell, pos, radius | 불꽃 폭발(반지름 = radius) |
| `spell:fizzle` | spell, reason? | 연기 「푸슉」 |
| `hit` | target(uid 또는 'player'), amount, crit, weak, pos, blocked? | 피격 플래시·숫자 |
| `block` | pos, perfect | 방패 파문 |
| `dodge` | dir, perfect | 잔상 |
| `enemy:spawn` | uid, kind, pos, label | 등장 고리 |
| `enemy:attack` | uid, kind, gauge? | 몸통 박치기 연출(gauge = 문제 게이지가 차서 친 공격) |
| `enemy:die` | uid, kind, pos | 소멸 폭발 |
| `telegraph:start` / `telegraph:end` | uid, shape, t1 | 바닥 빗금(시간은 스냅샷 기준) |
| `projectile:end` | uid | 탄 정리 |
| `crystal:spawn` / `crystal:break` | uid, pos | 수정 등장 / 깨짐 |
| `hint:crystal` | uids | 마나 부족 — 수정 쪽 화살표·「띵」 |
| `q:open` / `q:close` | id, concept | 문제 패널 열기·닫기 |
| `q:right` | id, slot, mana, streak | 정답 폭죽, 마나 구슬이 지팡이로 |
| `q:wrong` | id, slot, tag | 회색 흔들림, 낮은 「뿌웅」(혼내는 소리 아님) |
| `q:gauge` | id, uid | 게이지 가득 — 몬스터 공격 |
| `reward` | kind('mana'·'feather'), amount, pos | 줍기 반짝 |
| `mastery:up` | concept, stage('sprout'·'tree'·'fruit') | 도감 나무 자람 |
| `wave` | idx, of | 「몬스터가 와요!」 |
| `zone:enter` | zone, stage | 조명·음악 전환 |
| `stage:clear` / `player:defeat` | — | 승리·패배 연출 |
| `screen` | from, to | 화면 전환 |
| `ui:action` | id | (기록용) |
