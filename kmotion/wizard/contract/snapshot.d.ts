/**
 * MATH WIZARD 스냅샷 계약 v1 (contract "1") — 표현 층이 매 프레임 받는 읽기 전용 값.
 * 정본 설명: handoff kmotion/math-wizard/13_디자인_분리_명세.md 3-2절.
 * 단위: 미터·초·라디안. 좌표 Y 위, 전투장 중심 원점(플레이어 출발점), +Z = 카메라에서 멀어지는 쪽(적이 있는 쪽).
 * 규칙: 여기 없는 값을 스킨이 지어내지 않는다(체력바는 hp/hpMax 만). 스냅샷에 쓰기 금지(dev 에서 Object.freeze).
 */
export type Vec3 = [number, number, number];
export type ScreenId = 'S01' | 'S17' | 'S08' | 'S08Q' | 'S13' | 'S14';
export type AnimLower = 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A12' | 'A13' | 'A14' | 'A15';
export type AnimUpper = 'A07' | 'A08' | 'A09' | 'A10' | 'A11' | 'A16' | 'A17' | null;
export type EnemyState = 'spawn' | 'idle' | 'chase' | 'windup' | 'attack' | 'recover' | 'hurt' | 'stagger' | 'dead' | 'flee';

export interface Snapshot {
  t: number; gameT: number; slow: number;           // slow: 문제 중 0.15
  screen: ScreenId; paused: null | 'user' | 'body';
  world: { id: 'forest'; stage: string; zone: 'rail' | 'arena' | 'boss' | 'puzzle'; zoneIdx: number; arenas: number; railProgress: number; seed: number; wave: number; waves: number };
  player: {
    id: 'luna' | 'tori' | 'haru'; pos: Vec3; yaw: number; vel: Vec3;
    /** 4절 시간 규칙: phase 0~1 로 클립을 재매핑. A09(충전)의 upperPhase = 충전 비율 */
    anim: { lower: AnimLower; upper: AnimUpper; phase: number; upperPhase: number; speed: number };
    hp: number; hpMax: number; mana: number; manaMax: number;
    charging: { spell: string; ratio: number } | null; blocking: boolean; ducking: boolean; invuln: boolean; hurtT: number; empowered: boolean;
    castReady: boolean; spell: string; spellCost: number; feather: boolean;
    /** v1.1 마법 5종: spell = 지금 시전하면 나갈 것(마나 100 이면 meteor), main = 장착한 주 마법, spells = 바꿀 수 있는 주 마법 목록 */
    main: string; spells: string[]; arcana: null | { ratio: number; nullify: number }; shieldReady: boolean;
    outfit: { hat: string; cape: string; staff: string; bolt: string; trail: string | null };
  };
  enemies: Array<{ uid: number; kind: string; pos: Vec3; yaw: number; scale: number; state: EnemyState; stateT: number; hp: number; hpMax: number; label: string | null;
    /** 예고 — 있으면 스킨은 바닥 범위를 반드시 그린다(빨강 + 빗금). t0→t1 비율로 채움 */
    telegraph: { shape: 'circle' | 'line' | 'cone'; center: Vec3; size: number[]; t0: number; t1: number } | null; tags: string[] }>;
  /** 보스(v1.1 추가, 06 문서 4·5절). 보스방이 아니면 null. telegraphs 는 전부 그려야 한다(돌 3개처럼 여러 개일 수 있음) */
  boss: null | { uid: number; kind: string; pos: Vec3; yaw: number; scale: number;
    state: 'intro' | 'chase' | 'windup' | 'attack' | 'recover' | 'kneel' | 'phase' | 'dead'; stateT: number;
    attack: null | 'slam' | 'charge' | 'rocks' | 'quake' | string;
    phase: number; phases: number; hp: number; hpMax: number; phaseHp: number[]; phaseHpMax: number[];   // hp = 지금 페이즈 체력
    shield: number; shieldMax: number;                // 수학 보호막 칸(켜져 있으면 몸 공격 ×0.1)
    weak: number;                                     // 약점 시간 남은 비율 0~1(0 = 아님)
    telegraphs: Array<{ shape: 'circle' | 'line' | 'ring'; center: Vec3; size: number[]; yaw: number; t0: number; t1: number; label: string | null; avoid: null | 'duck' }>;
    nameKey: string };                                // line: size=[폭, 길이], yaw 방향 · ring: 전체 범위 — avoid 'duck' = 숙여서 피함
  projectiles: Array<{ uid: number; kind: 'bolt' | 'fireball' | string; pos: Vec3; vel: Vec3; owner: 'player' | number; label: string | null; r: number }>;
  areas: Array<{ uid: number; kind: 'explosion' | 'ice' | 'meteor' | string;   // ice: t0~t1 동안 얼음 폭풍 · meteor: t1 에 떨어짐(그림자 먼저)
                 pos: Vec3; radius: number; t0: number; t1: number }>;
  /** 수학 수정(v1 추가) — near = 지금 치면 열림 */
  crystals: Array<{ uid: number; kind: 'math' | 'empower'; pos: Vec3; near: boolean }>;
  pickups: Array<{ uid: number; kind: 'mana' | 'gold' | 'shard'; pos: Vec3 }>;
  question: null | {
    id: string; type: string; concept: string; kind?: 'crystal' | 'seal';   // seal = 보스 봉인 문제(v1.1)
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
  targets: Array<{ id: string; kind: 'choice' | 'hint' | 'crystal' | 'menu';   // hint = 🦉 힌트 구슬(v1.2, 문제 열려 있고 2단계 전까지) rect: { x: number; y: number; w: number; h: number }; hover: number; locked: boolean }>;
  input: { cursor: { x: number; y: number } | null; mode: 'camera' | 'keyboard'; body: 'ok' | 'lost' | 'partial'; calibrating: boolean;
    preview: { ok: boolean; joints: Array<[number, number, number] | null> } | null };   // joints: 0,11,12,13,14,15,16,23,24,25,26,27,28 (화면 비율, 거울)
  camera: { mode: 'rail' | 'arena' | 'boss-intro' | 'q'; target: Vec3; shake: number };
  toast: string | null; streak: number;
  result: null | { win: boolean; kills: number; q: number; right: number; time: number; keyboard: boolean; deaths: number };
}
/** 게임 밖 화면(S01 시작 · S17 보정) */
export interface MenuSnapshot { t: number; screen: 'S01' | 'S17';
  calib: null | { step: 'stand' | 'up' | 'side' | 'punch'; idx: number; of: number; msg: string; p: number };
  input: { preview: Snapshot['input']['preview']; mode: string }; title: null | { chars: string[]; char: string; hasCal: boolean } }
