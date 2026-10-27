// 이벤트 버스 — 시스템 안 알림 + 표현 층으로 나갈 이벤트 줄(queue)
// sim/ 규칙: three·document·window import 0 (노드에서 그대로 돎)
export function createBus(){
  const subs = new Map(); const out = [];
  return {
    on(type, fn){ (subs.get(type) || subs.set(type, []).get(type)).push(fn); },
    emit(type, data = {}){ const ev = Object.assign({ type }, data); out.push(ev); for (const k of [type, '*']) (subs.get(k) || []).forEach(f => f(ev)); return ev; },
    drain(){ return out.splice(0, out.length); },
  };
}
