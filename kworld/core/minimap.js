// 미니맵 — 조용한 길잡이. 아는 곳(가 본 장소)과 내 방향만. 반 멀티 2단계(10-12): 같은 시대에 들어온 반 친구가 점으로, 손 흔들면 그 점이 커졌다 작아진다.
//  · 장소는 세상의 area_* 에서(story-p1 처럼 area 가 없으면 옛 세 곳). 가 본 곳(14m 안에 들어온 적)만 이름이 붙고, 아직 못 가 본 곳은 희미한 점.
//  · 축척은 world.bounds(기본 116)로 맞춘다 — 넓은 터가 원 안에 다 들어온다.
// 땅 한 장 — 높이맵(engine.hm)에서 강·개울(파랑, 깊은 물은 짙게)·들(초록)·산(높을수록 밝은 흙빛)을 한 번만 그려 둔다. 없으면 옛 민무늬.
function paintLand(engine, canvas, scale, mid, size, deepWater) {
  const doc = canvas.ownerDocument || (typeof document !== 'undefined' ? document : null); if (!doc || !engine.hm) return null;
  const off = doc.createElement('canvas'); off.width = off.height = size; const c = off.getContext('2d'); if (!c || !c.createImageData) return null;
  const img = c.createImageData(size, size), d = img.data, hm = engine.hm, deep = deepWater ?? -1;
  let hi = 0; for (const row of hm.h) for (const v of row) if (v > hi) hi = v; hi = Math.max(hi, 4);
  const put = (i, r, g, b) => { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; };
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const x = (px - mid) / scale, z = (py - mid) / scale, i = (py * size + px) * 4;
    if (Math.abs(x) > hm.ext || Math.abs(z) > hm.ext) { put(i, 53, 69, 58); continue; }
    const h = engine.groundY(x, z);
    if (h < deep) put(i, 40, 74, 98);
    else if (h < 0) put(i, 66, 110, 132);
    else { const t = Math.min(1, h / hi); put(i, Math.round(53 + 60 * t), Math.round(69 + 38 * t), Math.round(58 + 22 * t)); }
  }
  c.putImageData(img, 0, 0);
  // 등고선 느낌 — 물가 선 한 줄
  c.globalAlpha = .18; c.strokeStyle = '#cfd8aa'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, size - 1, size - 1); c.globalAlpha = 1;
  return off;
}
export function bindMinimap(engine, player, canvas, game = null) {
  if (!canvas) return;
  const ctx=canvas.getContext('2d'), size=168, mid=size/2;
  const bounds=game?.world?.bounds||76, scale=(mid-8)/bounds;
  canvas.width=canvas.height=size;
  const names=game?.world?.areas||{};
  const spots=engine.areas?.size?[...engine.areas].map(([id,v])=>({id,name:names[id]?.name||'',x:v.x,z:v.z})):[{id:'camp',name:'야영지',x:-6,z:3},{id:'cave',name:'동굴',x:-27,z:5},{id:'wood',name:'숲',x:34,z:20}];
  const seen=new Set([game?.world?.face||'camp']);
  let elapsed=1, check=0, land=null;
  const point=(x,z)=>[mid+x*scale,mid+z*scale];
  engine.onFrame.push(dt=>{
    elapsed+=dt;check+=dt;if(elapsed<.15)return;elapsed=0;
    if(check>1){check=0;for(const s of spots)if(!seen.has(s.id)&&Math.hypot(s.x-player.pos.x,s.z-player.pos.z)<14)seen.add(s.id);}
    ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(mid,mid,mid-3,0,Math.PI*2);ctx.clip();
    if(!land&&engine.hm)land=paintLand(engine,canvas,scale,mid,size,game?.world?.deepWater);
    if(land){ctx.drawImage(land,0,0);}
    else{
      ctx.fillStyle='#35453a';ctx.fillRect(0,0,size,size);
      ctx.strokeStyle='rgba(207,216,170,.13)';ctx.lineWidth=1;
      for(let r=18;r<95;r+=17){ctx.beginPath();ctx.ellipse(37,120,r,r*.7,-.7,0,Math.PI*2);ctx.stroke();}
    }
    for(const s of spots){
      const [px,py]=point(s.x,s.z);
      if(seen.has(s.id)&&s.name){ctx.fillStyle='#ead5a8';ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(s.name,px,py+12);}
      else{ctx.fillStyle='rgba(234,213,168,.28)';ctx.beginPath();ctx.arc(px,py,1.6,0,Math.PI*2);ctx.fill();}
    }
    // 반 친구 — 점 + 이름 첫 글자, 손 흔드는 중이면 커졌다 작아진다
    const fr=game?.friends?.friends; if(fr&&fr.size){const now=performance.now();for(const f of fr.values()){const [px,py]=point(f.x,f.z);const wv=f.waveUntil>now;const r=wv?3.2+Math.sin(now*.02)*1.4:2.6;ctx.fillStyle=wv?'#ffe9a8':'#8fd3c7';ctx.shadowColor=wv?'#ffd36b':'transparent';ctx.shadowBlur=wv?8:0;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;const ch=String(f.body?.userData?.nick||'').replace(/^\d+\s*/,'').charAt(0);if(ch){ctx.fillStyle='#dff7f0';ctx.font='8px sans-serif';ctx.textAlign='center';ctx.fillText(ch,px,py-5);}}}
    const [x,y]=point(player.pos.x,player.pos.z);ctx.translate(x,y);ctx.rotate(-player.yaw);
    ctx.fillStyle='#fff4ce';ctx.shadowColor='#e9b65b';ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(-4,4);ctx.lineTo(0,2);ctx.lineTo(4,4);ctx.closePath();ctx.fill();ctx.restore();
    ctx.strokeStyle='rgba(235,215,170,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mid,mid,mid-3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#f3e6ce';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('N',mid,15);
  });
  return { spots, seen };
}
