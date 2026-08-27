// 가짜 촬영본: 천천히 흐르는 보케 + 켄번즈 (30초, 1920x1080, 30fps) — 부품 확인용
const {createCanvas}=require('canvas');const fs=require('fs');
const W=1920,H=1080,FPS=30,DUR=30;const dir='/tmp/bgseq';fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const blobs=Array.from({length:36},()=>({x:rnd()*W,y:rnd()*H,r:60+rnd()*220,a:.08+rnd()*.22,vx:(rnd()-.5)*22,vy:(rnd()-.5)*14}));
for(let i=0;i<DUR*FPS;i++){const t=i/FPS;const c=createCanvas(W,H),x=c.getContext('2d');
 const z=1+0.06*(t/DUR);x.save();x.translate(W/2,H/2);x.scale(z,z);x.translate(-W/2,-H/2);
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7fa8cf');g.addColorStop(.5,'#b9c9b3');g.addColorStop(1,'#6b7d52');x.fillStyle=g;x.fillRect(-100,-100,W+200,H+200);
 for(const b of blobs){const bx=b.x+b.vx*t,by=b.y+b.vy*t;const rg=x.createRadialGradient(bx,by,0,bx,by,b.r);rg.addColorStop(0,`rgba(255,255,255,${b.a})`);rg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=rg;x.fillRect(bx-b.r,by-b.r,b.r*2,b.r*2);}
 x.restore();fs.writeFileSync(`${dir}/f${String(i).padStart(5,'0')}.png`,c.toBuffer('image/png'));}
