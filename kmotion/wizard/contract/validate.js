// 스킨 검사기(13 문서 6절 4) — 브라우저 ?check=1 와 노드 tests/contract/check.mjs 가 같이 씀
export const CONTRACT = '1';
const FN = ['load', 'mount', 'render', 'onEvent', 'resize', 'setQuality', 'stats', 'dispose'];
const UI = ['show', 'update', 'hide', 'toast', 'bind'];
export function checkInterface(skin){
  const miss = FN.filter(k => typeof skin[k] !== 'function'); const umiss = skin.ui ? UI.filter(k => typeof skin.ui[k] !== 'function') : ['ui'];
  return { ok: !miss.length && !umiss.length, miss: [...miss, ...umiss.map(k => 'ui.' + k)] };
}
// 예고가 있는 몬스터마다 스킨이 바닥 표시를 만들었는지 — 스킨이 stats().telegraphs(그린 uid 목록)를 주면 대조
export function checkTelegraphs(snap, drawn){ const need = (snap.enemies || []).filter(e => e.telegraph).map(e => e.uid); const lack = need.filter(u => !(drawn || []).includes(u)); return { ok: !lack.length, lack }; }
// 눌리는 자리(rect) 와 그린 대상 위치 차이 — 스킨이 stats().targetRects 를 주면 대조(화면 비율 .02 안)
export function checkTargets(snap, drawn){ const bad = []; for (const t of snap.targets || []) { const d = (drawn || {})[t.id]; if (!d) { bad.push(t.id + ':없음'); continue; }
  const cx = t.rect.x + t.rect.w / 2, cy = t.rect.y + t.rect.h / 2; if (Math.abs(d.x - cx) > .02 || Math.abs(d.y - cy) > .02) bad.push(t.id); } return { ok: !bad.length, bad }; }
