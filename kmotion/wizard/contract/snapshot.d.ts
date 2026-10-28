/**
 * MATH WIZARD 스냅샷 계약 v1 (contract "1") — 표현 층이 매 프레임 받는 읽기 전용 값.
 * 정본 설명: handoff kmotion/math-wizard/13_디자인_분리_명세.md 3-2절.
 * 단위: 미터·초·라디안. 좌표 Y 위, 전투장 중심 원점(플레이어 출발점), +Z = 카메라에서 멀어지는 쪽(적이 있는 쪽).
 * 규칙: 여기 없는 값을 스킨이 지어내지 않는다(체력바는 hp/hpMax 만). 스냅샷에 쓰기 금지(dev 에서 Object.freeze).
 */
export type Vec3 = [number, number, number];
export type ScreenId = 'S01' | 'S04' | 'S17' | 'S08' | 'S08Q' | 'S08P' | 'S13' | 'S14';   // v1.5 S08P = 길 구간 수학 퍼즐(HUD 위에 퍼즐 판) · v1.9 S04 월드 지도(게임 밖 — MenuSnapshot.map)
export type AnimLower = 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A12' | 'A13' | 'A14' | 'A15';
export type AnimUpper = 'A07' | 'A08' | 'A09' | 'A10' | 'A11' | 'A16' | 'A17' | null;
export type EnemyState = 'spawn' | 'idle' | 'chase' | 'windup' | 'attack' | 'recover' | 'hurt' | 'stagger' | 'dead' | 'flee';

export interface Snapshot {
  t: number; gameT: number; slow: number;           // slow: 문제 중 0.15
  screen: ScreenId; paused: null | 'user' | 'body';
  world: { id: 'forest'; stage: string; heart: boolean; final: boolean; crystals: string[];   // v1.8 heart = 고대 나무 심장 구역(길·보스방) · final = 월드 마지막 스테이지 · crystals = 되찾은 결정
    zone: 'rail' | 'arena' | 'boss'; zoneIdx: number; arenaNo: number; arenas: number; railProgress: number; seed: number; wave: number; waves: number;
    /** v1.5 길 구간(09 문서 2절): 플레이어는 z=0 에 서고 길이 다가온다. dist·len(m)·speed(m/s, 퍼즐 앞 0·맞으면 느려짐)·phase 'go'|'stop'|'puzzle'·xMax(좌우 ±2.6). 스킨은 바닥·나무를 −speed 로 흘리면 된다 */
    rail: null | { idx: number; len: number; dist: number; progress: number; speed: number; base: number; phase: 'go' | 'stop' | 'puzzle'; xMax: number } };
  /** v1.5 길 위 물건(z = 앞 거리, −8 ~ 42m 만): rock(옆으로 비킴, r=반지름 .9·h) · branch(가지 — 숙여서, h=높이 1.25, 길 전체 폭) · firefly(반딧불, pos.y 떠 있음) · chest(상자). state ahead|passed|hit|taken */
  obstacles: { uid: number; kind: 'rock' | 'branch' | 'firefly' | 'chest'; pos: Vec3; r: number; h: number; state: 'ahead' | 'passed' | 'hit' | 'taken' }[];
  /** v1.5 수학 퍼즐(S08P, 07 문서 상황 D). 돌 고르기(number-bridge 2개·rule-stones 1개)는 targets kind 'puzzle'(rect = choices3) · size-gate 는 몸 위치(lane 'L'|'R') — 게이지 없음.
   *  state open → right(1.6초)|wrong(1.3초 → 다른 수로 다시, hint 켜짐)|reveal(3번 틀림 — 정답 돌 answer:true 2.8초 → 통과) · stones.lit = 집은 돌 · gate.answer 는 reveal/right 때만 */
  puzzle: null | { id: string; type: 'number-bridge' | 'size-gate' | 'rule-stones'; concept: string; state: 'open' | 'right' | 'wrong' | 'reveal'; stateT: number; prompt: TextRef; picks: (number | string)[]; wrong: number; maxWrong: number; need: number;
    hint: TextRef | null; seq: number[] | null; target: number | null;
    stones: null | { id: string; slot: number; num: number; targetId: string; lit: boolean; answer: boolean; wrong: boolean }[];
    gate: null | { left: number; right: number; bigger: boolean; picked: string | null; answer: 'L' | 'R' | null; lane: 'L' | 'R' | null } };
  player: {
    id: 'luna' | 'tori' | 'haru'; pos: Vec3; yaw: number; vel: Vec3;
    /** 4절 시간 규칙: phase 0~1 로 클립을 재매핑. A09(충전)의 upperPhase = 충전 비율 */
    anim: { lower: AnimLower; upper: AnimUpper; phase: number; upperPhase: number; speed: number };
    hp: number; hpMax: number; level: number; xp: number; xpNext: number;   // v1.3 레벨·경험치(11 문서) — 판 안에서 바로 오름 mana: number; manaMax: number;
    charging: { spell: string; ratio: number } | null; blocking: boolean; ducking: boolean; invuln: boolean; hurtT: number;
    empowered: boolean; empowerT: number;   // v1.4 강화 20초 — empowerT 남은 비율 0~1. 켜진 동안 마법 ×1.5·기본 공격이 강력 공격(A08). 스킨은 금빛 기운만 그린다
    castReady: boolean; spell: string; spellCost: number; feather: boolean;
    /** v1.1 마법 5종: spell = 지금 시전하면 나갈 것(마나 100 이면 meteor), main = 장착한 주 마법, spells = 바꿀 수 있는 주 마법 목록 */
    main: string; spells: string[]; arcana: null | { ratio: number; nullify: number }; shieldReady: boolean;
    outfit: { hat: string; cape: string; staff: string; bolt: string; trail: string | null };
  };
  enemies: Array<{ uid: number; kind: string; pos: Vec3; yaw: number; scale: number; state: EnemyState; stateT: number; hp: number; hpMax: number; label: string | null;
    /** 예고 — 있으면 스킨은 바닥 범위를 반드시 그린다(빨강 + 빗금). t0→t1 비율로 채움 */
    /** v1.4: line = 계산 고블린 조준선(size=[폭, 길이], yaw 방향 — 보스 돌진 띠와 같은 그림) · scale = 큰 슬라임 1.5 / 분열 작은 슬라임 .72(tags 'mini') · kind 'num-slime'|'big-slime'|'calc-goblin' */
    telegraph: { shape: 'circle' | 'line' | 'cone'; center: Vec3; size: number[]; yaw: number; t0: number; t1: number } | null; tags: string[] }>;
  /** 보스(v1.1 추가, 06 문서 4·5절). 보스방이 아니면 null. telegraphs 는 전부 그려야 한다(돌 3개처럼 여러 개일 수 있음) */
  boss: null | { uid: number; kind: string; pos: Vec3; yaw: number; scale: number;
    state: 'intro' | 'chase' | 'windup' | 'attack' | 'recover' | 'kneel' | 'phase' | 'dead'; stateT: number;
    attack: null | 'slam' | 'charge' | 'rocks' | 'quake' | string;
    phase: number; phases: number; hp: number; hpMax: number; phaseHp: number[]; phaseHpMax: number[];   // hp = 지금 페이즈 체력
    shield: number; shieldMax: number;                // 수학 보호막 칸(켜져 있으면 몸 공격 ×0.1)
    weak: number;                                     // 약점 시간 남은 비율 0~1(0 = 아님)
    telegraphs: Array<{ shape: 'circle' | 'line' | 'ring'; center: Vec3; size: number[]; yaw: number; t0: number; t1: number; label: string | null; avoid: null | 'duck' }>;
    nameKey: string };                                // line: size=[폭, 길이], yaw 방향 · ring: 전체 범위 — avoid 'duck' = 숙여서 피함
  /** v1.4: kind 'acorn' = 고블린 도토리(owner = 그 몬스터 uid, label = 식 「2+3」) — 플레이어만 맞춤, 숙이면 머리 위로 지나감 */
  projectiles: Array<{ uid: number; kind: 'bolt' | 'fireball' | 'acorn' | string; pos: Vec3; vel: Vec3; owner: 'player' | number; label: string | null; r: number }>;
  areas: Array<{ uid: number; kind: 'explosion' | 'ice' | 'meteor' | string;   // ice: t0~t1 동안 얼음 폭풍 · meteor: t1 에 떨어짐(그림자 먼저)
                 pos: Vec3; radius: number; t0: number; t1: number }>;
  /** 수학 수정(v1 추가) — near = 지금 치면 열림. v1.4 empower = 금빛 강화 수정(07 문서 상황 B): life = 남은 시간 비율(15초, 0 이면 사라짐) · retry = 오답 뒤 「다시 도전」 수정 */
  crystals: Array<{ uid: number; kind: 'math' | 'empower'; pos: Vec3; near: boolean; retry: boolean; life: number }>;
  pickups: Array<{ uid: number; kind: 'mana' | 'gold' | 'shard'; pos: Vec3 }>;
  question: null | {
    id: string; type: string; concept: string; kind: 'crystal' | 'seal' | 'power';   // seal = 보스 봉인 문제(v1.1) · power = 강화 문제(v1.4, 금빛 수정 — 패널 금테)
    prompt: { key: string; args: Record<string, string | number> };   // 문구 = text(key) 에 args 채우기
    state: 'open' | 'right' | 'wrong'; hintStep: number;
    gauge: number; gaugeOn: boolean;                  // 몬스터 공격 게이지 0~1 (가득 = 몬스터 1번 공격)
    readP: number;                                    // 읽기 보호 0~1 (1 전에는 고를 수 없음 — 흐리게)
    picked: number | null; reveal: number | null;     // reveal = 보여 줄 정답 자리
    explain: string | null;                           // 오답 해설 문구 키
    choices: Array<{ id: string; num: number; targetId: string }>;
    /** v1.2 힌트(07 문서 8절): 1단계 길잡이 문구 · 2단계 구슬 그림(a·b·연산 — 더하기는 a 뒤에 b 이어서, 빼기는 뒤 b개를 흐리게) */
    hint: { key: string; args: Record<string, string | number> } | null;
    hintPic: { kind: 'beads'; a: number; b: number; op: '+' | '-' } | null;
  };
  /** 손 선택 대상 — 3-5절. rect 는 화면 비율, 눌리는 자리 = rect. hover = 유지 게이지 */
  targets: Array<{ id: string; kind: 'choice' | 'hint' | 'crystal' | 'menu' | 'puzzle' | 'map';   // map = S04 지도 노드 'stage:<id>'·'enter'(v1.9, 카메라·마우스 손 유지 고르기 — MenuSnapshot.targets)   // hint = 🦉 힌트 구슬(v1.2, 문제 열려 있고 2단계 전까지) · menu = 멈춤 화면 손 유지 바퀴(v1.3, 카메라 모드만): 'spell:<id>'(주 마법)·'resume' rect: { x: number; y: number; w: number; h: number }; hover: number; locked: boolean }>;
  input: { cursor: { x: number; y: number } | null; mode: 'camera' | 'keyboard'; body: 'ok' | 'lost' | 'partial'; calibrating: boolean;
    preview: { ok: boolean; joints: Array<[number, number, number] | null> } | null };   // joints: 0,11,12,13,14,15,16,23,24,25,26,27,28 (화면 비율, 거울)
  camera: { mode: 'rail' | 'arena' | 'boss-intro' | 'q' | 'puzzle'; target: Vec3; shake: number };   // v1.5 rail = 03 문서 길 카메라(camera.json rail: 뒤 6.5·높이 2.6·앞 6m 봄·FOV 58+달리기 6) · puzzle = 멈춘 길
  toast: string | null; streak: number;
  result: null | { crystal: string | null; final: boolean;   // v1.8 되찾은 결정(첫 클리어만)·월드 마지막
    win: boolean; kills: number; q: number; right: number; time: number; keyboard: boolean; deaths: number; xp: number; level: number; levelUps: number[];
    empowers: number; splits: number; niceDodges: number;   // v1.4 강화 성공·분열·도토리 멋진 회피 횟수
    fireflies: number; chests: number; gold: number; puzzles: number; puzzleRight: number; obstaclesHit: number; nicePasses: number; stars: [boolean, boolean, boolean] };   // v1.5 길 구간 — 별 3개 = 클리어·반딧불 7↑·정답률 70%↑(퍼즐 포함)
}
/** 게임 밖 화면(S01 시작 · S17 보정) */
export interface MenuSnapshot { t: number; screen: 'S01' | 'S04' | 'S17';
  calib: null | { step: 'stand' | 'up' | 'side' | 'punch'; idx: number; of: number; msg: string; p: number };
  input: { preview: Snapshot['input']['preview']; mode: string; cursor: null | { x: number; y: number } }; title: null | { chars?: string[]; char: string; hasCal?: boolean; stages?: unknown[]; stage?: string };
  /** v1.9 S04 월드 지도(10 문서 S04 받침대 + S06 지도) — 노드·들어가기 자리는 targets(kind 'map') rect 그대로, 받침대 6개는 보기만(눌리는 자리 아님) */
  map: null | { world: string; worldName: string; stages: Array<{ id: string; nameKo: string; stars: number; locked: boolean; requires: string | null; reward: string | null; crystal: string | null; final: boolean }>;
    stage: string; locked: boolean; learn: string[]; recLevel: number; stars: number; level: number; xp: number;
    pedestals: Array<{ idx: number; crystal: string; world: string | null; worldName: string; icon: string; open: boolean; got: boolean }>;
    targets: Snapshot['targets'] };
  targets: Snapshot['targets'];   // S04 에서만 채움(kind 'map': 'stage:<id>' ×스테이지 수 + 'enter', 잠긴 스테이지도 눌림 — 손을 대면 잠김 토스트)
  toast: string | null }   // 지도 토스트 키(map.locked.<stage>)
