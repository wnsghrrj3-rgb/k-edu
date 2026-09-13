// A quiet orientation aid: only known landmarks and the player's current heading.
export function bindMinimap(engine, player, canvas) {
  if (!canvas) return;
  const ctx=canvas.getContext('2d'), size=168, scale=1.1, mid=size/2;
  canvas.width=canvas.height=size;
  let elapsed=1;
  const point=(x,z)=>[mid+x*scale,mid+z*scale];
  engine.onFrame.push(dt=>{
    elapsed+=dt;if(elapsed<.15)return;elapsed=0;
    ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(mid,mid,mid-3,0,Math.PI*2);ctx.clip();
    ctx.fillStyle='#35453a';ctx.fillRect(0,0,size,size);
    ctx.strokeStyle='rgba(207,216,170,.13)';ctx.lineWidth=1;
    for(let r=18;r<95;r+=17){ctx.beginPath();ctx.ellipse(37,120,r,r*.7,-.7,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#638e96';ctx.fillRect(0,mid-33*scale,size,14*scale);
    ctx.strokeStyle='rgba(238,215,173,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...point(-22,5));ctx.lineTo(...point(-6,3));ctx.lineTo(...point(0,-17));ctx.stroke();
    for(const [name,x,z] of [['야영지',-6,3],['동굴',-27,5],['숲',34,20]]){
      const [px,py]=point(x,z);ctx.fillStyle='#ead5a8';ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(name,px,py+12);
    }
    const [x,y]=point(player.pos.x,player.pos.z);ctx.translate(x,y);ctx.rotate(-player.yaw);
    ctx.fillStyle='#fff4ce';ctx.shadowColor='#e9b65b';ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(-4,4);ctx.lineTo(0,2);ctx.lineTo(4,4);ctx.closePath();ctx.fill();ctx.restore();
    ctx.strokeStyle='rgba(235,215,170,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mid,mid,mid-3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#f3e6ce';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('N',mid,15);
  });
}
