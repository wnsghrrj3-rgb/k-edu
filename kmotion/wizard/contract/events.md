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
v1.5 추가(P3 길 구간): `rail:start`(idx·len·seconds·obstacles) / `rail:end`(idx·hits·passes) · `obstacle:hit`(uid·kind·pos — 바위·가지에 맞음, 피해 + 1.2초 느려짐) · `obstacle:pass`(uid·kind·nice — 비켜 지나감, nice = 가까이 스쳐 「멋진 통과」 마나 +2) · `pickup`(uid·kind 'firefly'|'chest'·pos·n|gold·mana) · `puzzle:open`(id·ptype·wrong·hint) / `puzzle:pick`(id·slot|side·via) / `puzzle:right`(id·gold·mana·pos) / `puzzle:wrong`(id·wrong·ptype — 돌 가라앉음·문 튕김) / `puzzle:reveal`(id·answer — 3번 틀려 정답 보여 줌) / `puzzle:close`(id·solved·wrong) · `zone:enter` 에 zone 'rail'|'arena'|'boss'·arenaNo · `enemy:spawn` 에 rail(길 위 몬스터) · `screen` S08↔S08P · `xp` why 'puzzle' · snapshot: screen 'S08P', world.zone 'rail'·arenaNo·rail{...}, obstacles[], puzzle{...}, targets kind 'puzzle', camera.mode 'rail'|'puzzle', result.fireflies/chests/gold/puzzles/puzzleRight/obstaclesHit/nicePasses/stars.

## v1.6 추가(2026-10-28, 1-2 「버섯 마을 길」) — 추가만, 기존 변경 0
| type | 필드 | 표현 예 |
|---|---|---|
| `enemy:shieldHit` | uid, kind, amount, left, pos | 방패병 방패가 마법탄을 받음 — 나무 「턱」, 몸 피해 0 |
| `enemy:shieldBreak` | uid, kind, pos, byMath | 방패 깨짐 — byMath 면 유리 소리+FOV, 아니면 「쾅」·조각 |
| `bounce` | uid, pos, n, mana | 버섯 튕김 발판 — 플레이어 폴짝(스킨 연출, `player.hopping` 동안) |
| `stage:clear` | stage, stars, **reward**(마법 id 또는 null) | 보상 토스트 `toast.reward.<id>` |
- 스냅샷 추가: `enemies[].shield {hp,hpMax,up,broken,byMath,eq}`(방패병만, 그 외 null) · `player.hopping` · `world.stageName` · `puzzle.mush {a,b}`(mushroom-add) · `question.kind 'shield'`·`shieldUid` · `obstacles[].kind 'mushroom'`(state ahead|bounced|passed) · `result.reward/shields/bounces` · 시작 화면 `title.stages[{id,nameKo,stars,locked,requires,reward}]`·`title.stage`
- UI action `start` 에 `stage` 추가 · boot `?stage=forest-1-2`(잠김 무시) · progress(`kmwiz.progress`)에 `cleared{}`·`unlocked[]`

## v1.7 추가(2026-10-28, 1-3 「반딧불 동굴」) — 추가만, 기존 변경 0
| type | 필드 | 표현 예 |
|---|---|---|
| `enemy:crack` | uid, kind, down, max, def, pos | 수정 골렘이 수학 정답에 갈라짐(DEF −8, 최대 −16) — 청록 빛·금 늘어남·「🛡 10 → 2」 |
| `hit` | **deflect**(bool) | 안 갈라진 수정 골렘에 마법탄 ×.4 「팅」 — 작은 하얀 불꽃·고음 |
| `zone:enter` | **dark**(bool) | 어두운 구역(동굴) — 조명·안개 어둡게, 지팡이 빛 |
- 스냅샷 추가: `world.dark`·`world.light`(지팡이 빛 거리 m) · `world.rail.dark/light` · `obstacles[].lit`(어두운 길에서 지팡이 빛 밖 = false → 그리지 않음, 반딧불은 늘 true) · `enemies[].crack {down,max,ratio,def}`(수정 골렘만, 그 외 null) · `question.kind 'golem'`·`golemUid` · `puzzle.bundle {hund,tens,ones}`(crystal-count) · `result.cracks`
- 퍼즐 종류 `crystal-count`(수정 묶음 세기 — 10개씩 묶음 + 낱개 → 모두 몇 개, 돌 3개 중 1, 개념 `g1.count.tens`) · 토스트 `toast.golem/golemCrack/golemOpen/dark` · boot `?stage=forest-1-3`

## v1.8 추가(2026-10-28, 1-보스 「고대 나무 심장」) — 추가만, 기존 변경 0
| type | 필드 | 표현 예 |
|---|---|---|
| `reward` | **kind 'crystal'**, crystal('number'), amount, pos | 보스 뒤 「수의 결정」 되찾음 — 보라 큰 폭발·고대 나무 숫자 무늬 환해짐(09 문서 1절 「결정 복구 장면」) |
| `stage:clear` | **crystal**(string|null), **final**(bool) | 결정 토스트 `toast.reward.crystal.<name>` · final = 월드 마지막 스테이지 |
- 스냅샷 추가: `world.heart`(고대 나무 심장 구역 — 길·보스방 둘 다, 스킨은 거대 나무+숫자 무늬를 둠) · `world.final` · `world.crystals[]`(되찾은 결정) · `result.crystal`·`result.final`
- 스테이지 JSON: `final`·`reward.crystal` · 구역 `heart`·`toast`(구역 들어갈 때 한마디 — 보스 전 한마디) · 보스 구역 `hpMul`(페이즈 HP 배율, 1-보스 ×1.2 — def 복사, 다른 스테이지 무변경)
- 길 → 보스방 바로 이어질 때 `world.rail` 이 null 로 돌아감(1-보스 — 이전엔 전투장을 거쳐서 문제 없었음) · 시작 화면 `title.stages[].crystal/final`(👑) · boot `?stage=forest-1-boss`

## v1.9 추가(2026-10-28, S04 월드 지도) — 추가만, 기존 변경 0
| type | 필드 | 표현 예 |
|---|---|---|
| `screen` | from, **to 'S04'** | S01·S17·S13·S14 → S04 지도 · S04 → S08(들어가기) |
| `map:pick` | stage, locked, via('hand'|'click'|'key') | 노드 고름 — 잠겼으면 토스트 `map.locked.<stage>`(아이콘 흔들림), 아니면 선택 테 |
| `map:enter` | stage, via | 들어가기 — 문 열림 소리·전환 |
- 흐름: `start` → (카메라 첫 판 S17 보정) → **S04** → `enter` → S08. 결과 화면 `map` → S04(마스터리·progress 유지). `?stage=`(forceStage)만 지도 없이 바로 판(시험용·골든 리플레이 무변경)
- MenuSnapshot 추가: `map{world,worldName,stages[],stage,locked,learn[](개념 키 — 스킨은 `learn.<키>` 문구로),recLevel,stars,level,xp,pedestals[6]{crystal,world,worldName,icon,open,got},targets}` · `targets`(kind **`map`**: `stage:<id>`·`enter`) · `toast` · `input.cursor`
- 데이터: `data/worlds.json`(결정 6·월드 6 — 받침대 순서, 시스템 소유) · `data/layout/targets.json` **`map`**(노드 4·enter rect) · ko.json `map.*`·`crystal.*`·`learn.*`·`clear.map`
- 시작 화면 `title.stages` 는 남지만 proto 는 더 안 그림(지도로). 키보드 모드 S04: ←→/↑↓ 고르기 · 1~4 · Enter/Space 들어가기 · Esc 처음으로

## v2.3 추가(2026-10-29, 3학년 「똑같이 나누기 공격」 — 15 문서 D-29~31) — 추가만, 기존 변경 0
| type | 필드 | 표현 예 |
|---|---|---|
| `enemy:pack` | id, n, hpEach, total, uids[] | 묶음 등장 — 머리 위 숫자(= 현재 HP)·HUD 묶음 띠 「🟢×n = 합」·토스트 `toast.pack`(처음) |
| `enemy:packClear` | id, byMath, n, released, counted | 묶음 끝 — counted(수학으로 전부 처치)면 clear 소리·fov 펄스·토스트 `toast.packClear`, 아니면 `toast.packDone`·띠만 사라짐 |
| `share:scatter` | packId, n | 오답 — 회색 탄 n발 흩어짐(피해 0)·토스트 `toast.shareScatter` |
| `attack:fire` | +share: true, label | share 탄 발사(마리마다 1발, label = 정답 숫자) — 청록 탄 |
| `hit` | +exact: true | 정확 피해 채널(D-29) — 피해 숫자 청록 「수학 빛」·glass 소리(치명·강화 표시 없음) |
| `enemy:die` | +exact: boolean | share 탄으로 처치 |
| `enemy:spawn` | +pack: id \| null | 묶음 소속 스폰 |
- 스냅샷 추가(`snapshot.d.ts`): `enemies[].pack {id,n,hpEach}` · `packs[] {id,n,hpEach,total,alive,sum,uids[],retried}`(산 묶음만 — 띠는 alive·sum, sum ≠ alive×hpEach 면 흐트러짐 표시) · `projectiles[].exact`(정확 피해 양, 0 = 일반)·`scatter`(흩어진 탄, kind 'share') · `question.kind 'share'`·`packId`·`shareUids[]`·`hintPic.kind 'groups' {n, each}`(n줄 × each 구슬 그림) · `result.packClears/shareRight/shareWrong`
- 데이터: `data/concepts-by-grade.json`(학년 변환표 — 스테이지별 `g3/g4 {concepts, fallback, packs}` + `pack.g3/g4` 수 범위, 시스템 소유) · boot `?grade=3|4`(같은 스테이지 재사용, 1학년 줄 없음 = 장면 JSON 그대로) · ko.json `q.share.*`·`hint.share.*`·`toast.pack/shareGo/shareScatter/packClear/packDone`·`learn.g3.share.*`·`why.*` 7키
- 수정 kind 우선순위: 방패 > 골렘 > **share**(산 묶음 있을 때) · 묶음당 쉬운 재도전 수정 1번(`crystals[].retry`) · 3학년 일반 생성기 0 이면 fallback(share 3종)으로 보통·봉인·강화 수정을 채움(`QuestionEngine.empty`)
