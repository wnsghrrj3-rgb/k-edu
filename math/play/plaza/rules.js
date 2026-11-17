/* 작은 광장 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/N02 2절.
 * 내 항구. 다리 길에서 데려온 주민과 남은 나무(판자)가 여기 있다. 나무 더미에서 판자 묶음(1·2·5장)을 끌어 지을 자리에 놓는다.
 * 지을 자리 팻말에 드는 나무 수가 적혀 있고 놓을수록 준다. 딱 채우면 지어진다. 넘치게 놓은 판자는 더미로 도로 튀어 돌아간다(쉬는 곳 — 잃지 않는다).
 * 지은 뒤 「나무가 몇 장 남았지?」(12 − 8 = ?) — 맞는 수를 누르면 더미 팻말이 그 수로 바뀐다. 시계는 없다. */
// ── 내가 정한 수치(준호가 해 보고 바꾼다)
export const BUNDLES = [1, 2, 5];
/** 지을 것(차례대로). need = 드는 나무 범위(지을 때마다 그 안에서 하나로 정함). model = 꾸러미 모형 · opt = 모형을 아직 내려받지 못했으면 건너뜀. */
export const BUILDS = [
  { id: 'fix', need: [5, 8], model: 'Environment_Dock' },           // 부서진 선착장 고치기(처음부터 보이는 부서진 조각이 온전한 선착장으로)
  { id: 'dock', need: [7, 10], model: 'Environment_Dock' },         // 선착장 넓히기
  { id: 'store', need: [9, 12], model: 'Prop_Barrel' },             // 통 창고(통 셋)
  /* 더 지을 것(Cute Fish Pack 의 선착장·배 모형) — 지으면 다른 섬에 새것이 열린다(gives → common/loop.js) */
  { id: 'stairs', need: [8, 11], model: 'Env2_Dock_Stairs', gives: 'raft' },     // 배 타는 계단: 다리 길을 떠날 때마다 덤 뗏목 하나
  { id: 'pier', need: [10, 14], model: 'Env2_Dock_Long', gives: 'deep' },         // 낚시터: 낚시 섬이 깊은 바다(통·물고기 수가 한 걸음 큼)
  { id: 'rowboat', need: [12, 16], model: 'Prop_Rowboat', gives: 'catch' },       // 작은 배: 주민이 하루 한 번 물고기를 잡아 옴
  { id: 'wharf', need: [14, 18], model: 'Env2_Dock_Wide', gives: 'queue' },       // 넓은 부두: 장터 줄이 한 명 길어짐
  { id: 'hut', need: [11, 15], model: 'Environment_House1', opt: true },     // 오두막
  { id: 'tower', need: [13, 17], model: 'Environment_House3', opt: true },   // 망루
  { id: 'light', need: [15, 19], model: 'Environment_House2', opt: true } ]; // 등대 자리
/** 다음에 지을 것(이미 지은 것·모형이 없는 것은 건너뜀). have = 쓸 수 있는 모형 이름들(Set). */
export function next(built, have){ return BUILDS.find(b => !built.includes(b.id) && (!b.opt || have.has(b.model))) || null; }
export function needFor(b, rnd = Math.random){ const [a, c] = b.need; return a + Math.floor(rnd() * (c - a + 1)); }
/** 남은 자리 left 에 묶음 n 을 놓으면: put(놓이는 수) · back(더미로 도로 가는 수) · done(다 참) */
export function place(left, n){ const put = Math.min(left, n); return { put, back: n - put, left: left - put, done: left - put === 0 }; }
/** 더미에서 끌 수 있는 묶음(더미에 그만큼 있어야 함). */
export const bundles = wood => BUNDLES.filter(n => n <= wood);
/** 지은 뒤의 물음: 나무가 몇 장 남았지? */
export const leftover = (wood, need) => wood - need;
