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

## v2.4 추가(2026-10-30, 방패병 방패 식·길 퍼즐을 3학년 변환표 안으로 — D-31 보충) — 추가만, 기존 변경 0 · 새 이벤트 0
- 스냅샷: `enemies[].shield.eq` 문자열이 3·4학년에선 「□ × b = c」(1학년 「□ + b = c」 그대로 — 스킨은 문자열만 그리므로 무변경) · `question.kind 'shield'` 의 문제가 3학년↑ `q.shield.mul`(정답 = c ÷ b, hint2 groups) · `puzzle.op '+'|'×'`·`puzzle.mul`(위 d.ts)
- 데이터: `data/concepts-by-grade.json` `shield.g3/g4 {concept, b[], ans[]}`(4학년 답 ≤12) · `puzzle.g3/g4 {bridge 'mul', mushroom 'mul', ruleMul 비율}` — 줄 없는 학년(1·2)은 전부 그대로(골든 불변) · ko.json `q/hint.shield.mul`·`learn.g3.shield.mul`·`pz.bridge.mul*`·`pz.mush.mul*`·`pz.rule.mul.hint`·`why.sub-instead-mul/add-instead-mul`

## v2.5 추가(2026-10-30, 묶음 자리 — 4학년 묶음 n 과 maxEnemies 관계 정리) — 데이터·시스템 수치만, 새 이벤트 0·스냅샷 변경 0
- 산 묶음 하나는 `maxEnemies` 에서 `min(산 마리, GAME.pack.slots=3)` 자리만 차지(보통 적 1마리 = 1자리, 분열 mini·보스는 전처럼 안 셈). 묶음 n 은 학년 변환표 `pack.n` 범위 그대로(4학년 ≤8, 3학년 ≤6) — 전엔 남은 자리에 깎여 실제 ≤5~6. 자리가 slots 에 모자라면 n 을 남은 자리로 깎고, 2 미만이면 보통 파.
- 스킨 영향 0(`packs[].alive`·`enemies[].pack` 그대로). 1~2학년은 묶음이 없어 무변경(골든 4판 그대로).

## v2.9 추가(2026-11-02, 월드 2 「도형의 신전」 — 16 문서 D-32~35) — 추가만, 기존 변경 0 · 골든 4판 불변
| type | 필드 | 표현 예 |
|---|---|---|
| `map:world` | world, open, via('hand'|'click'|'key') | S04 에서 세계 바꾸기 — 열렸으면 지도 테마·제목(`map.worldIcon`·`worldName`)·노드 교체, 닫혔으면 토스트 `map.worldClosed`(지도 그대로) |
- 세계 바꾸기 입력 3가지가 전부 같은 액션 `world {id|dir, via}`: targets `world:prev`·`world:next`(kind `map`, `targets.json map.worldPrev/worldNext` rect — 이웃 세계가 있을 때만 들어가고 닫힌 세계는 locked) · 받침대(`map.pedestals[].world`) 클릭 = `{id}` · 키 `[` `]` · ←→/↑↓ 화살표가 세계 끝 칸을 넘어가면 이웃 세계로. 세계마다 마지막으로 고른 칸을 기억(없으면 앞으로 갈 땐 첫 칸·뒤로 갈 땐 끝 칸).
- MenuSnapshot `map` 추가: `worldIcon`·`worldIdx`(worlds.json 순서) · `stages[]` = **지금 월드만**(전엔 숲 4개 고정) · `stars` 는 전체 합 · targets 에 `world:prev`/`world:next`. Snapshot `world.id` = 스테이지의 월드(`'forest' | 'temple' | …`, 전엔 `'forest'` 고정) — 스킨은 `root[data-world]`(판)·`map[data-world]`(지도)로 테마 색.
- 문제 스냅샷 추가(`snapshot.d.ts` v2.9 주석): `question.pic`(문제 그림 id 또는 null)·`choices[].pic`(보기 그림 id — 있으면 구슬에 숫자 대신 그림, `num` 은 그림 코드라 안 보임) · 엔진 반환 `pic`/`choicePic`. 답은 그대로 **정수 하나**(D-33) → build·피해·골든 줄 무변경. 그림 id 는 `sim/learn/pics.js`(도형 9·물건 9·`row:a,b,c`·`cubes:2,1,3`), 그리는 건 스킨(`skins/proto/pics.js` 인라인 SVG). 새 이벤트 0.
- 데이터: `data/stages/temple-2-1.json`(world temple·requires forest-1-boss·길 A→전투장 1→길 B→전투장 2, 방패병·퍼즐·보스 없음) · `worlds.json` temple open · `concepts-by-grade.json` `temple-2-1.g2` 5키(3·4학년 줄 없음 = 1학년 입체 값) · 생성기 `sim/learn/gen/g1_1_u2.js` 3종·`g2_1_u2.js` 5종 · ko.json `stage.temple-2-1`·`map.locked.temple-2-1`·`map.world.temple`·`map.worldPrev/Next/Closed`·`result.world2` + learn·q·hint·why 59키.
- boot `?stage=temple-2-1`(forceStage)·`?grade=2&stage=temple-2-1`. 키보드 모드 S04: `[` `]` 세계 · 화살표 끝 칸 넘김.
- v2.9.1(검증만): smoke-proto 시드 65 「흩어진 탄 0」 원인 = 44 일반 생성기 뒤 share 문제가 봇의 홀수 번째(항상 정답)에만 와 흩어짐 경로가 안 돌던 것 → 시드 67 과 같이 첫 share 문제를 일부러 틀리게 함(시험 코드만, sim 무변경).

## v2.10 추가(2026-11-02, 신전 3학년 줄 — 16 문서 8절 ④) — 이벤트·스냅샷 모양 변경 0 · 골든 4판 불변
- 학년 변환표 `temple-2-1.g3`(7키: 3-1 2단원 `g3.line.find`·`g3.right.find`·`g3.quad.right`·`g3.right.count` + 3-2 3단원 `g3.circle.part`·`g3.circle.dia`·`g3.circle.same`)·`g4`(4-1 생성기 전까지 g3 과 같은 임시 줄). packs 없음.
- 그림 id 추가(`sim/learn/pics.js` 코드 10~32): 선 `seg·seg2·ray·ray2·line·line2` · 각 `rangle·rangle2·angle·angle2` · `rtri·rtri2` · `rect·rect2·square·square2·quad3` · 원 `cdia·cdia2·cchord·crad·crad2·cline`. 스킨은 id 만 받아 그린다(proto 인라인 SVG 23개 추가). 직각 세기·원 길이 문제는 `question.pic` 만, 나머지는 `choices[].pic`.

## v2.11 추가(2026-11-02, 월드 2 모양 열쇠 문 — 16 문서 8절 ③) — 새 이벤트 0 · 스냅샷 추가만 · 골든 4판 불변
- 퍼즐 종류 `shape-key`(`temple-2-1` 길 B 60%): 문 구멍(`puzzle.hole {pic, name, kind}`)에 꼭 맞는 모양의 열쇠 돌 3개 중 1(need 1, targets kind 'puzzle' 그대로). `puzzle.stones[].pic` = 열쇠 돌 그림 id(num = `pics.js` 코드), 숫자 퍼즐은 null. 이벤트는 `puzzle:open/pick/right/wrong/reveal/close` 그대로(ptype 'shape-key').
- v3.1 퍼즐 종류 `length-bridge`(`canyon-3-1` 길 B 60%, 월드 3 「측정의 협곡」): 끊어진 다리 틈(`puzzle.hole {pic, name, kind:'length'}`)에 꼭 맞는 길이의 널빤지 3개 중 1(need 1, targets kind 'puzzle' 그대로, 틀림 3번 reveal 규칙 그대로). 1학년 `hole.pic = 'gap:n'`(눈 비교) · `stones[].pic = 'plank:a'`(그림 돌, num = 칸 수) · 2학년↑ `hole.pic = 'gapcm:a,b'`(자 눈금 a~b) · `stones[].pic = null`(숫자 돌 = cm). 스킨은 id 만 그린다. 이벤트·스냅샷 구조 추가 없음(`stones[].pic` 은 돌이 직접 든 id 가 우선, 없으면 모양 코드 — 숫자 퍼즐은 그대로 null).
- 학년 줄(변환표 줄과 같은 생각, 코드 `sim/learn/puzzles.js SHAPE_KEY_SETS`): 1학년 = 물건 구멍(책·통조림·귤 …) → 입체 열쇠 7·8·9(concept `g1.solid.same`) · 2학년 = 평면 구멍 → 같은 묶음의 다른 변형(`g2.plane.pick`) · 3·4학년 = 직각 도형 구멍(직각·직각삼각형·직사각형·정사각형)과 개념 오답(직각 없는 삼각형·사각형, 직사각형 ↔ 정사각형; `g3.right.find`·`g3.quad.right`) — 직사각형 구멍엔 정사각형 돌 없음(두 답 방지).
- 문구 키 `pz.key`·`pz.key.solid`·`pz.key.hint`·`pz.key.solid.hint`·`pz.key.hint.rtri/rect/square/rangle`·`pz.keyWrong`. 스킨(proto): 구멍 = `.mw-pz .prompt .hole` 어두운 판 + 그림 id · 열쇠 돌 = `.mw-stone.pic`.

## v2.12 추가(2026-11-02, 월드 2 도형 정령 모양 보호막 — 16 문서 8절 ② · 06 문서 44행) — 추가만 · 골든 4판 불변
- 새 이벤트 2: `enemy:spiritBreak {uid, kind, fam, weakT, pos}`(이름 정답 → 보호막 깨짐·약점 시작) · `enemy:spiritShield {uid, kind, fam, pic, pos}`(약점 4초 뒤 다른 모양 보호막).
- `hit` 에 `shielded`(정령 보호막 켜짐 ×0.3)·`weak`(약점 ×1.5) 값이 정령에도 실림. `enemy:shoot` 정령은 `label: null`.
- Snapshot: `enemies[].spirit {fam, pic, up, weak, weakT, breaks}` · `projectiles[].pic`(kind `shard`) · `question.kind 'spirit'`·`question.spiritUid` · `result.spiritBreaks`.
- 그림 코드 40~48 = 이름 판(`nm-box·nm-cyl·nm-ball·nm-tri·nm-quad·nm-circ·nm-rtri·nm-rect·nm-square`) — 보기 구슬에 그림 대신 이름 글자. 스킨은 id 만 받아 그린다.
- 생성기 `g1.solid.name`·`g2.plane.name`·`g3.rshape.name`(fixedOnly — 정령 전용, 오답 재도전 예약 없음). 문구 ko 25키(`q.spirit*`·`hint.spirit.*`·`why.nm-*`·`learn.*.name`·`toast.spirit*`).

## v2.15 추가(2026-11-03, 월드 2 보스 「기하학 수호신」 — 16 문서 9절, ✋Q-08 기본값 a 그대로·b 1·2학년도 분신·c 각도 지팡이 보류) — 추가만 · 골든 4판 불변
- 이벤트: `boss:wall {uid, holes[{pic,x}], answerPic|null, concept, name, toast{key,args}, t1}`(모양 벽 시작 — 1페이즈 몸풀기 벽은 구멍 1·answerPic null) · `boss:wallPass {uid, ok, slot, answer?, name?, free?}`(예고 끝 몸 x 판정 한 번 — free = 봉인 문제가 열려 그냥 지나감) · `boss:wallEnd {uid}` · `boss:mirror {uid, bodies[{x,pic}], pic, concept, name, t}`(거울 분신 hold 시작 — 진짜는 안 알려줌) · `boss:mirrorHit {uid, real, x, pos?}` · `boss:mirrorEnd {uid, real:true|null}` · `telegraph:start.shape` 에 `'wall'`·`'mirror'` 추가, `attack` 에 `'beam'|'wall'|'mirror'`, 분신 광선은 `n: 3`.
- `dodge` 에 `wall: true`(벽 통과) · `reward kind 'mana' amount 5`(벽 통과) · `stage:clear.crystal 'shape'` · `reward kind 'crystal' crystal 'shape'`.
- Snapshot `boss`: `wall {holes[{pic,x}], answerPic, name, concept, judged} | null` · `mirrors [{x,z,pic}] | null`(사라진 분신 빠짐) · `mirrorPic`·`mirrorName` · `hold`(남은 비율) · `stun`(경직 남은 비율) · `state` 에 `'hold'|'stun'` · `telegraphs[]` 에 `holes|null`·`beam:boolean` · `attack` 에 `'beam'|'wall'|'mirror'`. `question.kind 'seal'` 마지막 칸은 신전이면 이름 판(`g*.*.name`, `pic`·`choices[].pic nm-*`).
- 데이터: `data/stages/temple-2-boss.json`(requires temple-2-1 · final false · 길 20초 → 보스 · reward.crystal shape) · `enemies.json geo-guardian`(beam 12·wall 14/3초·quake 18·mirror 8 hold 5 stun 2, 페이즈 200×3 보호막 0/2/3, 2페이즈 칸마다 `shape-spirit-lite` 소환) · `concepts-by-grade.json temple-2-boss`(= temple-2-1) · ko.json 16키(`toast.wall*`·`toast.mirror*`·`toast.beam`·`toast.guard.*`·`boss.geo-guardian`·`result.world2boss`·`toast.reward.crystal.shape`·`stage/map.locked.temple-2-boss`).
- 스킨 proto: `makeGuardian/poseGuardian`(정십이면체·금 고리 = 남은 페이즈·가슴 문양 판·분신 껍데기 3·약점 = 납작) · 예고 `wall` = `makeTelegraphWall`(구멍 3, 답만 뚫림, 9m 에서 다가옴) · `mirror` = 바닥 고리(ring 재사용) · `beam` = line 그대로.

## v3.4 추가(2026-11-03, 월드 3 시간 정령 「시계 보호막」 — 17 문서 2차 ⑤ · 09 문서 5절 W3 6행) — 새 이벤트 0 · 스냅샷 추가만 · 골든 4판 불변
- 몬스터 `time-spirit`(enemies.json `spirit: 'time'`): 도형 정령과 같은 몸·공격(조각 shard)·수치·이벤트(`enemy:spiritBreak`·`enemy:spiritShield`) — 보호막만 시계. `enemy:spiritShield.pic` 과 Snapshot `enemies[].spirit.pic` 이 `'clock:h,m[,s]'` **그림 문자열**(PIC 코드 id 가 아님; 스킨은 id 로만 그림). Snapshot `enemies[].spirit.type: 'shape'|'time'` 추가(도형 정령 = 'shape').
- 문제: `question.kind 'spirit'` 그대로, `question.pic 'clock:h,m[,s]'` · `choices[].pic 'tm:h,m[,s]'`(시각 글자 판 — 「7시 30분」·정각은 「7시」·초는 두 줄) · `choices[].num` = 부호화 시각(h*100+m / 초 있으면 h*10000+m*100+s) — 구슬엔 글자 판만 보임. 생성기 `g1.clock.read`(1-2 3단원 정각·30분)·`g2.clock.read`(2-2 4단원 5분·1분)·`g3.clock.read`(3-1 5단원 초, 4학년 = 3학년 임시), fixedOnly. 오답 태그 `clock-hour-next`·`clock-hour-prev`·`clock-half-as-hour`·`clock-swap`·`clock-min-num`·`clock-min-one`·`clock-round-five`·`clock-sec-num`·`clock-sec-five`(지도서 오개념). `q:wrong.tag` 에 그대로.
- 스냅샷 `question.choices[].pic` 이 숫자 코드가 아닌 문자열 그림도 됨(엔진 `choicePicOf`). ko 19키(`q.spirit.time`·`learn.g*.clock.read`·`hint.spirit.{hour,half,five,one,sec}`·`why.clock-*`·`toast.timeSpirit`).
- 데이터: `data/stages/canyon-3-1.json` 전투장 2 파 1·파 3 에 `time-spirit`(신전과 같은 자리). 스킨 proto: `time-spirit` = `makeSpirit/poseSpirit` 재사용(호박빛 몸), `pics.js clock:/tm:`(svgMarkup 도 그림 문자열 처리 → 3D 보호막 판에 시계).
