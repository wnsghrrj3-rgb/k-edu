/* 공통 엔진 · 자동 확인 — 머리 없는 브라우저에서 정해 둔 차례대로 놀아 보고, 끝나면 상태를 제목에 적는다.
 * 주소: ?auto=명령,명령,…  (명령 = 이름:값:값). 「step:초」는 어느 구역에서나 그만큼 시간을 흘린다. 나머지 명령은 구역이 정한다. */
import { Q } from './stage.js';

/** o = { step(dt), commands:{ 이름: async (a, b, tick) => … }, summary() → 적을 것, settle(처음에 흘리는 장면 수) } */
export async function runAuto(stage, o) {
  const tick = async () => { o.step(1 / 60); stage.tick(1 / 60); for (let i = 0; i < 8; i++) await null; };      // 장면 사이에 끊긴 일(await)들이 이어지게 쉰다
  for (let i = 0; i < (o.settle ?? 30); i++) await tick();
  for (const cmd of (Q.get('auto') || '').split(',')) {
    const [k, a, b, ...more] = cmd.split(':'); if (!k) continue;
    if (k === 'step') for (let i = 0; i < +a * 60; i++) await tick(); else if (o.commands[k]) await o.commands[k](a, b, tick, ...more);      // 셋째 값부터는 tick 뒤에 넘긴다(set:물건:상태:값) else console.error('모르는 명령: ' + k);
  }
  stage.st.ready = true; stage.render(); document.title = 'READY ' + JSON.stringify(o.summary());
}
