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
| `xp` | amount, why('kill'·'boss'·'q'·'clear'), level, pos | 경험치 — 떠오르는 「+n XP」(v1.3) |
| `level:up` | level, hpMax, atk, def | 레벨 업 팡파르·입자·토스트(v1.3) |
| `q:hint` | id, step(1·2), auto | 🦉 힌트 열림 — 1단계 문구·2단계 구슬 그림(v1.2; auto = 1~2학년 6초 자동) |
| `zone:enter` | zone, idx, stage | 전투장 들어감(idx 0 = 첫 전투장, 1 = 전투장 2 — 「다음 전투장으로!」, v1.2) |
| `reward` | kind('mana'·'feather'), amount, pos | 줍기 반짝 |
| `mastery:up` | concept, stage('sprout'·'tree'·'fruit') | 도감 나무 자람 |
| `wave` | idx, of | 「몬스터가 와요!」 |
| `zone:enter` | zone, stage | 조명·음악 전환 |
| `stage:clear` / `player:defeat` | — | 승리·패배 연출 |
| `screen` | from, to | 화면 전환 |
| `ui:action` | id | (기록용) |
| `boss:intro` | uid, kind, phase, pos | 등장 컷(카메라 mode 'boss-intro' 동안) · 이름 띠 |
| `boss:shield` | uid, n, max | 수학 보호막 칸 펼침 |
| `boss:seal` | uid, left, max, pos | 봉인 문제 정답 → 칸 하나 깨짐(유리 「쾅!」) |
| `boss:weak` | uid, on, t? | 약점 시간 시작(무릎 꿇음)·끝 |
| `boss:phaseEnd` / `boss:phase` | uid, phase | 페이즈 체력 0 → 1.5초 연출 → 다음 페이즈 |
| `boss:die` | uid | 쓰러짐(뒤이어 `enemy:die` boss:true, `stage:clear`) |

v1.1 추가 필드: `telegraph:start` 에 attack·n, `q:open` 에 kind('crystal'·'seal'), `hit` 에 shielded, `dodge` 에 duck(땅 흔들기를 숙여서 피함).
| `spell:chain` | spell, points[] | 번개 사슬 — 지팡이 끝 → 대상들 꺾인 선(v1.1) |
| `shield:on` / `shield:block` | t / nullify | 비전 방패 켜짐 / 막음(nullify = 완전 무효) |
| `spell:equip` | spell | 마법 바퀴에서 주 마법 바꿈 |
v1.2 추가: `q:hint`·`zone:enter` idx, snapshot.question.hint/hintPic·targets kind 'hint'·world.zoneIdx/arenas, UI action 'hint', 문제 type 'word1'(문장제 — 보스 마지막 봉인 칸).
v1.3 추가: `xp`·`level:up`, snapshot.player.level/xp/xpNext, result.xp/level/levelUps, targets kind 'menu'(멈춤 화면 손 유지 바퀴 — 카메라 모드만, `layout.pauseMenu`), UI action 'spell' 은 그대로.
v1.4 추가(P2 ④): `empower:on`(t·mul·pos — 강화 시작, 금빛 기운·팡파르) / `empower:off` · `enemy:split`(uid·kind·pos·parts[a,b]·label·uids·prevented — 큰 슬라임 가르기; prevented = 정답 6초 안 처치라 분열 없음) · `enemy:shoot`(uid·kind·pid·from·label — 고블린 도토리 던짐, 「끽」) · `projectile:hit`(uid·target 'player') · `enemy:spawn` 에 mini·from(분열로 생긴 작은 슬라임) · `enemy:attack` 에 shoot · `crystal:spawn`/`crystal:break` 에 kind('math'·'empower')·retry·fade(15초 지나 사라짐 — 벌 없음) · `dodge` 에 acorn·duck(도토리를 날아오는 중 회피·숙이기로 피함 = 「멋진 회피」 마나 +3, 뒤이어 `reward` mana) · snapshot: enemies.telegraph.yaw·scale·kind 3종, projectiles kind 'acorn'+label, crystals.retry/life, question.kind 'power', player.empowerT, result.empowers/splits/niceDodges.
