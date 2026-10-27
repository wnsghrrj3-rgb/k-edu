// empty 스킨 — 계약만 지키고 아무것도 그리지 않는다(three·DOM 0 → 노드에서도 로드됨). 게임 결과가 스킨과 무관한지 대조용
export const CONTRACT = '1';
export function createSkin(ctx){
  let frames = 0, events = 0, last = null; const shown = new Set();
  return {
    ui: { show(id){ shown.add(id); }, update(){}, hide(id){ shown.delete(id); }, toast(){}, bind(){} },
    async load(progress){ progress(1); }, mount(){},
    render(snap){ frames++; last = snap.screen; }, onEvent(){ events++; },
    resize(){}, setQuality(){}, dispose(){},
    stats(){ return { drawCalls: 0, triangles: 0, textures: 0, frames, events, screen: last, telegraphs: [], targetRects: {} }; },
  };
}
