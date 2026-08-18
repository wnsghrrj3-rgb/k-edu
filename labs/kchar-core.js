/* ════════════════════════════════════════════════════════════
   KChar — 케이아트 오리지널 캐릭터 리그 코어 v1
   9종 캐릭터를 포즈 파라미터로 그리는 단일 소스.
   전부 코드 벡터 = 저작권 0. 본보기 애니·도장·향후 색칠 도안 공용.

   KChar.draw(ctx, id, pose)
   pose = {
     x:450, y:560,   // 발 기준점 (지면)
     s:1,            // 크기 배율
     tilt:0,         // 전체 기울기(라디안)
     jump:0,         // 공중 높이(px, 위로)
     bob:0,          // 머리 까딱(px)
     armL:0, armR:0, // 팔 각도(라디안, 0=내림, -2.6=만세)
     legL:0, legR:0, // 다리 앞뒤(px, +앞)
     tail:0,         // 꼬리 흔들 -1..1
     ear:0,          // 귀 펄럭 0..1
     mood:'base',    // base|joy|wow|sleep
     blink:0,        // 1=눈 감음
     eyeX:0, eyeY:0  // 눈동자 -1..1
   }
   결정적: 같은 (id,pose)면 항상 같은 그림. 배경은 그리지 않음.
   ════════════════════════════════════════════════════════════ */
window.KChar = (function(){
  var TAU = Math.PI*2;

  var CHARS = [
    {id:'koko',   name:'코코',     emoji:'🦊', role:'주인공 여우'},
    {id:'greeny', name:'초록이',   emoji:'🦕', role:'아기 공룡'},
    {id:'moony',  name:'달님이',   emoji:'🐰', role:'토끼'},
    {id:'owl',    name:'부엉박사', emoji:'🦉', role:'지식 담당'},
    {id:'navi',   name:'나비',     emoji:'🐱', role:'새침 고양이'},
    {id:'pogeun', name:'포근이',   emoji:'🐻', role:'포옹 담당 곰'},
    {id:'quack',  name:'꽥이',     emoji:'🦆', role:'호기심 오리'},
    {id:'kbot',   name:'케이봇',   emoji:'🤖', role:'도우미 로봇'},
    {id:'mundol', name:'문돌이',   emoji:'🐙', role:'바다 문어'}
  ];
  function findChar(id){ for(var i=0;i<CHARS.length;i++) if(CHARS[i].id===id) return CHARS[i]; return null; }

  /* ── 그리기 도우미 ── */
  function mk(ctx){
    var h = {};
    h.rg = function(cx,cy,r,st){ var g=ctx.createRadialGradient(cx-r*0.35,cy-r*0.45,r*0.1,cx,cy,r*1.15);
      for(var i=0;i<st.length;i++) g.addColorStop(st[i][0],st[i][1]); return g; };
    h.ell = function(cx,cy,rx,ry,f,rot){ ctx.fillStyle=f; ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,rot||0,0,TAU); ctx.fill(); };
    h.cir = function(cx,cy,r,f){ ctx.fillStyle=f; ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU); ctx.fill(); };
    h.P = function(fn,f){ ctx.beginPath(); fn(); ctx.closePath(); ctx.fillStyle=f; ctx.fill(); };
    h.st = function(fn,c,w){ ctx.strokeStyle=c; ctx.lineWidth=w; ctx.lineCap='round'; ctx.beginPath(); fn(); ctx.stroke(); };
    return h;
  }

  /* 빅아이 문법: 흰자 → 홍채(그라데) → 큰 하이라이트 + 작은 하이라이트 */
  function faceEyes(ctx,h,cx,cy,gap,rw,rh,iris,pose){
    if(pose.blink || pose.mood==='sleep'){
      h.st(function(){ ctx.moveTo(cx-gap-rw*0.8,cy); ctx.quadraticCurveTo(cx-gap,cy+rh*0.35,cx-gap+rw*0.8,cy); },'#3B2410',Math.max(6,rw*0.24));
      h.st(function(){ ctx.moveTo(cx+gap-rw*0.8,cy); ctx.quadraticCurveTo(cx+gap,cy+rh*0.35,cx+gap+rw*0.8,cy); },'#3B2410',Math.max(6,rw*0.24));
      return;
    }
    if(pose.mood==='joy'){
      h.st(function(){ ctx.arc(cx-gap,cy+rh*0.2,rw*0.62,Math.PI+0.4,TAU-0.4); },'#3B2410',Math.max(6,rw*0.26));
      h.st(function(){ ctx.arc(cx+gap,cy+rh*0.2,rw*0.62,Math.PI+0.4,TAU-0.4); },'#3B2410',Math.max(6,rw*0.26));
      return;
    }
    var wow = pose.mood==='wow' ? 1.16 : 1;
    var ex = (pose.eyeX||0)*rw*0.3, ey = (pose.eyeY||0)*rh*0.22;
    [-1,1].forEach(function(sg){
      var bx = cx+sg*gap;
      h.ell(bx,cy,rw*wow,rh*wow,'#FFF');
      var ix = bx+ex, iy = cy+rh*0.06+ey;
      h.ell(ix,iy,rw*0.62,rh*0.7,h.rg(ix,iy,rw*0.66,[[0,iris[0]],[1,iris[1]]]));
      h.cir(ix+rw*0.2,iy-rh*0.3,rw*0.24,'#FFF');
      h.cir(ix-rw*0.16,iy+rh*0.2,rw*0.1,'rgba(255,255,255,.85)');
    });
  }
  function mouthFor(ctx,h,cx,my,pose,ink){
    if(pose.mood==='joy'){
      h.st(function(){ ctx.arc(cx,my,24,0.3,Math.PI-0.3); },ink,8);
      h.P(function(){ ctx.moveTo(cx-12,my+13); ctx.quadraticCurveTo(cx,my+26,cx+12,my+13); ctx.quadraticCurveTo(cx,my+18,cx-12,my+13); },'#E85566');
    } else if(pose.mood==='wow'){
      h.ell(cx,my+6,14,19,'#5C3418'); h.ell(cx,my+11,9,10,'#E85566');
    } else if(pose.mood==='sleep'){
      h.ell(cx,my+4,11,7,ink);
    } else {
      h.st(function(){ ctx.arc(cx,my,16,0.35,Math.PI-0.35); },ink,7);
    }
  }
  function blush(h,cx,cy,gap,r){ h.ell(cx-gap,cy,r,r*0.6,'rgba(255,115,135,.42)'); h.ell(cx+gap,cy,r,r*0.6,'rgba(255,115,135,.42)'); }
  function rim(ctx,h,cx,cy,r){ h.st(function(){ ctx.arc(cx,cy,r,-2.5,-1.4); },'rgba(255,255,255,.55)',7); }
  function arm(ctx,h,sx,sy,ang,len,col,pawCol,pawR){
    ctx.save(); ctx.translate(sx,sy); ctx.rotate(ang);
    h.ell(0,len*0.5,len*0.34,len*0.62,col);
    h.ell(0,len*1.02,pawR,pawR*0.9,pawCol);
    ctx.restore();
  }

  /* ── 캐릭터별 본체 (지면 y=0 기준 로컬, 위가 음수) ── */
  var BODY = {};

  BODY.koko = function(ctx,h,p){
    var tw = (p.tail||0);
    ctx.save(); ctx.translate(150,-130); ctx.rotate(0.5+tw*0.35);
    h.ell(0,0,150,72,h.rg(0,0,150,[[0,'#FFB25C'],[0.72,'#F98E2B'],[1,'#E5761B']]));
    h.ell(96,10,58,44,'#FFF6EC'); ctx.restore();
    h.ell(0,-120,140,150,h.rg(0,-120,150,[[0,'#FFC276'],[0.7,'#F99B3D'],[1,'#E07C1F']]));
    h.ell(0,-78,88,96,'#FFF3E2');
    h.ell(-70+(p.legL||0),-8,42,32,'#7A4A1E'); h.ell(70+(p.legR||0),-8,42,32,'#7A4A1E');
    arm(ctx,h,-118,-186,0.55+(p.armL||0),62,'#F28A2A','#7A4A1E',23);
    arm(ctx,h, 118,-186,-0.55-(p.armR||0),62,'#F28A2A','#7A4A1E',23);
    var hb = -300+(p.bob||0), ef=(p.ear||0)*26;
    h.P(function(){ ctx.moveTo(-150,hb-60); ctx.quadraticCurveTo(-190,hb-190+ef,-96,hb-146+ef); ctx.quadraticCurveTo(-70,hb-120,-84,hb-72); },'#F08A28');
    h.P(function(){ ctx.moveTo( 150,hb-60); ctx.quadraticCurveTo( 190,hb-190+ef, 96,hb-146+ef); ctx.quadraticCurveTo( 70,hb-120, 84,hb-72); },'#F08A28');
    h.ell(-118,hb-120+ef*0.6,26,40,'#8A4A1E',0.35); h.ell(118,hb-120+ef*0.6,26,40,'#8A4A1E',-0.35);
    h.ell(0,hb,178,158,h.rg(0,hb,175,[[0,'#FFC97E'],[0.66,'#F99B3D'],[1,'#E07C1F']]));
    h.ell(-96,hb+48,78,66,'#FFF6EC',0.25); h.ell(96,hb+48,78,66,'#FFF6EC',-0.25);
    faceEyes(ctx,h,0,hb-12,68,40,48,['#7A4A2A','#3B2410'],p);
    blush(h,0,hb+32,118,25);
    h.ell(0,hb+60,54,42,'#FFF6EC'); h.ell(0,hb+38,20,14,'#3E2412'); h.cir(-6,hb+34,5,'rgba(255,255,255,.8)');
    mouthFor(ctx,h,0,hb+74,p,'#7A4A1E');
    rim(ctx,h,0,hb,168);
  };

  BODY.greeny = function(ctx,h,p){
    var tw=(p.tail||0);
    ctx.save(); ctx.translate(112,-100); ctx.rotate(0.7+tw*0.5);
    h.ell(0,0,74,40,'#6FB03E'); h.ell(48,-4,26,26,'#CBEF9E'); ctx.restore();
    h.ell(0,-130,124,140,h.rg(0,-130,140,[[0,'#A9E074'],[0.7,'#7CC24A'],[1,'#579930']]));
    h.ell(0,-96,78,92,'#EFF9D8');
    h.ell(-58+(p.legL||0),-6,38,26,'#4E8A2E'); h.ell(58+(p.legR||0),-6,38,26,'#4E8A2E');
    [-1.95,-1.55,-1.15].forEach(function(a){
      var bx=Math.cos(a)*126, by=-130+Math.sin(a)*140;
      h.P(function(){ ctx.moveTo(bx-24,by+8); ctx.quadraticCurveTo(bx,by-42,bx+24,by+8); },'#579930');
    });
    arm(ctx,h,-104,-170,0.5+(p.armL||0),52,'#6FB03E','#4E8A2E',19);
    arm(ctx,h, 104,-170,-0.5-(p.armR||0),52,'#6FB03E','#4E8A2E',19);
    var hb=-296+(p.bob||0);
    h.ell(0,hb,132,116,h.rg(0,hb,130,[[0,'#B4E884'],[0.68,'#7CC24A'],[1,'#579930']]));
    faceEyes(ctx,h,0,hb-10,50,36,44,['#3E5E2A','#1E3312'],p);
    blush(h,0,hb+34,96,22);
    h.ell(-20,hb+52,9,12,'#4E8A2E',0.2); h.ell(20,hb+52,9,12,'#4E8A2E',-0.2);
    mouthFor(ctx,h,0,hb+62,p,'#3E6E22');
    rim(ctx,h,0,hb,124);
  };

  BODY.moony = function(ctx,h,p){
    var ef=(p.ear||0);
    h.ell(-52,-436+ef*30,34,96-ef*22,'#F7F2FC',-0.12-ef*0.35);
    h.ell( 52,-436+ef*30,34,96-ef*22,'#F7F2FC', 0.12+ef*0.35);
    h.ell(-50,-430+ef*28,17,66-ef*16,'#FFC9D6',-0.12-ef*0.35);
    h.ell( 50,-430+ef*28,17,66-ef*16,'#FFC9D6', 0.12+ef*0.35);
    h.ell(0,-120,116,132,h.rg(0,-120,132,[[0,'#FFFFFF'],[0.72,'#F2ECF8'],[1,'#D9CFE8']]));
    h.ell(0,-88,72,86,'#FFF');
    h.ell(-52+(p.legL||0),-4,36,24,'#D9CFE8'); h.ell(52+(p.legR||0),-4,36,24,'#D9CFE8');
    arm(ctx,h,-98,-160,0.5+(p.armL||0),50,'#F2ECF8','#E4DAF0',18);
    arm(ctx,h, 98,-160,-0.5-(p.armR||0),50,'#F2ECF8','#E4DAF0',18);
    var hb=-280+(p.bob||0);
    h.ell(0,hb,124,110,h.rg(0,hb,122,[[0,'#FFFFFF'],[0.7,'#F4EEFA'],[1,'#DCD2EA']]));
    faceEyes(ctx,h,0,hb-8,46,34,42,['#6A5A8E','#2E2444'],p);
    blush(h,0,hb+34,88,22);
    h.P(function(){ ctx.moveTo(0,hb+38); ctx.lineTo(-12,hb+24); ctx.lineTo(12,hb+24); },'#F084A0');
    h.st(function(){ ctx.moveTo(0,hb+38); ctx.quadraticCurveTo(0,hb+54,-16,hb+60); },'#8A7AA8',6);
    h.st(function(){ ctx.moveTo(0,hb+38); ctx.quadraticCurveTo(0,hb+54, 16,hb+60); },'#8A7AA8',6);
    ctx.fillStyle='#FFF'; ctx.strokeStyle='#D9CFE8'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.rect(-11,hb+62,11,14); ctx.rect(0,hb+62,11,14); ctx.fill(); ctx.stroke();
    rim(ctx,h,0,hb,116);
  };

  BODY.owl = function(ctx,h,p){
    h.ell(0,-140,108,150,h.rg(0,-140,150,[[0,'#B98A5C'],[0.7,'#96683C'],[1,'#7A5028']]));
    h.ell(0,-108,70,96,'#F2E3CB');
    var hb=-210+(p.bob||0);
    [-1,1].forEach(function(sg){ h.P(function(){ ctx.moveTo(sg*60,hb-58); ctx.quadraticCurveTo(sg*96,hb-110,sg*44,hb-86); },'#7A5028'); });
    ctx.save(); ctx.translate(-104,-140); ctx.rotate(0.35+(p.armL||0)); h.ell(0,0,26,64,'#7A5028'); ctx.restore();
    ctx.save(); ctx.translate( 104,-140); ctx.rotate(-0.35-(p.armR||0)); h.ell(0,0,26,64,'#7A5028'); ctx.restore();
    faceEyes(ctx,h,0,hb,44,34,38,['#6A4A2A','#2E1C0C'],p);
    h.st(function(){ ctx.arc(-44,hb,42,0,TAU); },'#4E3418',7);
    h.st(function(){ ctx.arc( 44,hb,42,0,TAU); },'#4E3418',7);
    h.st(function(){ ctx.moveTo(-4,hb); ctx.lineTo(4,hb); },'#4E3418',7);
    blush(h,0,hb+52,84,20);
    h.P(function(){ ctx.moveTo(0,hb+34); ctx.lineTo(-13,hb+52); ctx.lineTo(13,hb+52); },'#F59E0B');
    if(p.mood==='joy'||p.mood==='wow') mouthFor(ctx,h,0,hb+66,p,'#6B4A22');
    h.ell(-40+(p.legL||0),2,26,16,'#F59E0B'); h.ell(40+(p.legR||0),2,26,16,'#F59E0B');
    rim(ctx,h,0,-140,120);
  };

  BODY.navi = function(ctx,h,p){
    var hb=-244+(p.bob||0), ef=(p.ear||0)*18;
    h.P(function(){ ctx.moveTo(-92,hb+(-22)); ctx.quadraticCurveTo(-120,hb-106+ef,-40,hb-62); },'#8FA8C8');
    h.P(function(){ ctx.moveTo( 92,hb+(-22)); ctx.quadraticCurveTo( 120,hb-106+ef, 40,hb-62); },'#8FA8C8');
    h.P(function(){ ctx.moveTo(-82,hb-30); ctx.quadraticCurveTo(-100,hb-82+ef,-52,hb-52); },'#F0B4C4');
    h.P(function(){ ctx.moveTo( 82,hb-30); ctx.quadraticCurveTo( 100,hb-82+ef, 52,hb-52); },'#F0B4C4');
    h.ell(0,-120,112,132,h.rg(0,-120,132,[[0,'#BFD2E8'],[0.7,'#93AECB'],[1,'#7591B3']]));
    h.ell(0,-92,70,86,'#F4F8FC');
    var tw=(p.tail||0);
    ctx.save(); ctx.translate(128,-150); ctx.rotate(-0.7+tw*0.4);
    h.ell(0,0,86,30,'#7591B3'); h.ell(62,0,26,26,'#F0B4C4'); ctx.restore();
    h.ell(-48+(p.legL||0),2,32,20,'#7591B3'); h.ell(48+(p.legR||0),2,32,20,'#7591B3');
    arm(ctx,h,-96,-160,0.5+(p.armL||0),48,'#93AECB','#7591B3',17);
    arm(ctx,h, 96,-160,-0.5-(p.armR||0),48,'#93AECB','#7591B3',17);
    h.ell(0,hb,118,102,h.rg(0,hb,116,[[0,'#C9DAEC'],[0.7,'#93AECB'],[1,'#7591B3']]));
    [-1,0,1].forEach(function(k){ h.st(function(){ ctx.moveTo(k*26-8,hb-92); ctx.lineTo(k*26+8,hb-74); },'#7591B3',7); });
    faceEyes(ctx,h,0,hb-8,44,32,40,['#4E7A46','#1E3A18'],p);
    blush(h,0,hb+38,84,20);
    h.P(function(){ ctx.moveTo(0,hb+32); ctx.lineTo(-10,hb+20); ctx.lineTo(10,hb+20); },'#F084A0');
    h.st(function(){ ctx.moveTo(0,hb+34); ctx.quadraticCurveTo(0,hb+48,-14,hb+52); },'#5C7490',6);
    h.st(function(){ ctx.moveTo(0,hb+34); ctx.quadraticCurveTo(0,hb+48, 14,hb+52); },'#5C7490',6);
    [-1,1].forEach(function(sg){
      h.st(function(){ ctx.moveTo(sg*96,hb+20); ctx.lineTo(sg*146,hb+12); },'#B9C9DC',4);
      h.st(function(){ ctx.moveTo(sg*96,hb+36); ctx.lineTo(sg*148,hb+38); },'#B9C9DC',4);
    });
    rim(ctx,h,0,hb,110);
  };

  BODY.pogeun = function(ctx,h,p){
    var hb=-252+(p.bob||0);
    h.cir(-92,hb-78,40,'#8A5A34'); h.cir(92,hb-78,40,'#8A5A34');
    h.cir(-92,hb-78,22,'#C89A6E'); h.cir(92,hb-78,22,'#C89A6E');
    h.ell(0,-120,130,142,h.rg(0,-120,142,[[0,'#B9834E'],[0.7,'#96633B'],[1,'#7A4A26']]));
    h.ell(0,-88,84,94,'#EFD9BC');
    arm(ctx,h,-124,-180,0.5+(p.armL||0),58,'#96633B','#7A4A26',24);
    arm(ctx,h, 124,-180,-0.5-(p.armR||0),58,'#96633B','#7A4A26',24);
    h.ell(-64+(p.legL||0),0,44,28,'#7A4A26'); h.ell(64+(p.legR||0),0,44,28,'#7A4A26');
    h.ell(-64+(p.legL||0),-4,24,14,'#EFD9BC'); h.ell(64+(p.legR||0),-4,24,14,'#EFD9BC');
    h.ell(0,hb,128,112,h.rg(0,hb,126,[[0,'#C89258'],[0.7,'#9E6A3A'],[1,'#7A4A26']]));
    faceEyes(ctx,h,0,hb-10,46,30,36,['#4A2E14','#1E1006'],p);
    blush(h,0,hb+38,88,21);
    h.ell(0,hb+44,52,40,'#EFD9BC'); h.ell(0,hb+26,20,14,'#3A2410');
    mouthFor(ctx,h,0,hb+56,p,'#6B4422');
    rim(ctx,h,0,hb,120);
  };

  BODY.quack = function(ctx,h,p){
    h.ell(0,-110,110,120,h.rg(0,-110,120,[[0,'#FFE28A'],[0.7,'#FFD34D'],[1,'#F0B429']]));
    h.ell(0,-84,70,78,'#FFF6D8');
    ctx.save(); ctx.translate(-100,-130); ctx.rotate(0.2+(p.armL||0)); h.ell(0,10,26,52,'#F0B429',0.2); ctx.restore();
    ctx.save(); ctx.translate( 100,-130); ctx.rotate(-0.2-(p.armR||0)); h.ell(0,10,26,52,'#F0B429',-0.2); ctx.restore();
    var hb=-232+(p.bob||0);
    h.ell(0,hb,100,92,h.rg(0,hb,100,[[0,'#FFE9A2'],[0.7,'#FFD34D'],[1,'#F0B429']]));
    h.P(function(){ ctx.moveTo(-14,hb-90); ctx.quadraticCurveTo(0,hb-112,16,hb-92); ctx.quadraticCurveTo(4,hb-86,-14,hb-90); },'#F0B429');
    faceEyes(ctx,h,0,hb-12,40,28,34,['#4A3A1E','#1C1206'],p);
    blush(h,0,hb+34,74,18);
    h.ell(0,hb+40,44,24,h.rg(0,hb+40,40,[[0,'#FFAB4A'],[1,'#F07E1A']]));
    h.ell(0,hb+48,34,12,'#F07E1A');
    h.cir(-14,hb+34,4,'rgba(120,60,10,.5)'); h.cir(14,hb+34,4,'rgba(120,60,10,.5)');
    h.P(function(){ ctx.moveTo(-58+(p.legL||0),8); ctx.lineTo(-90+(p.legL||0),26); ctx.lineTo(-30+(p.legL||0),26); },'#F07E1A');
    h.P(function(){ ctx.moveTo( 58+(p.legR||0),8); ctx.lineTo( 90+(p.legR||0),26); ctx.lineTo( 30+(p.legR||0),26); },'#F07E1A');
    rim(ctx,h,0,hb,94);
  };

  BODY.kbot = function(ctx,h,p){
    var hb=-240+(p.bob||0);
    h.st(function(){ ctx.moveTo(0,hb-90); ctx.lineTo(0,hb-124); },'#8A9AB8',7);
    h.cir(0,hb-134,12,(p.mood==='wow')?'#FFD34D':'#FF8FA3');
    ctx.fillStyle=h.rg(0,hb,120,[[0,'#EAF2FC'],[0.7,'#C9D8EC'],[1,'#A9BCD8']]);
    ctx.beginPath(); ctx.roundRect(-104,hb-90,208,180,44); ctx.fill();
    ctx.fillStyle='#26385A';
    ctx.beginPath(); ctx.roundRect(-74,hb-66,148,96,26); ctx.fill();
    /* 디지털 눈 */
    if(p.blink||p.mood==='sleep'){
      h.st(function(){ ctx.moveTo(-50,hb-18); ctx.lineTo(-22,hb-18); },'#7DF9FF',7);
      h.st(function(){ ctx.moveTo( 22,hb-18); ctx.lineTo( 50,hb-18); },'#7DF9FF',7);
    } else {
      var ex=(p.eyeX||0)*10;
      h.ell(-36+ex,hb-18,17*(p.mood==='wow'?1.2:1),22*(p.mood==='wow'?1.2:1),'#7DF9FF');
      h.ell( 36+ex,hb-18,17*(p.mood==='wow'?1.2:1),22*(p.mood==='wow'?1.2:1),'#7DF9FF');
      h.cir(-31+ex,hb-26,6,'#FFF'); h.cir(41+ex,hb-26,6,'#FFF');
    }
    if(p.mood==='joy') h.st(function(){ ctx.arc(0,hb+2,20,0.3,Math.PI-0.3); },'#7DF9FF',6);
    else if(p.mood==='wow') h.ell(0,hb+8,10,12,'#7DF9FF');
    else h.st(function(){ ctx.moveTo(-14,hb+8); ctx.lineTo(14,hb+8); },'#7DF9FF',6);
    blush(h,0,hb+16,66,14);
    ctx.fillStyle=h.rg(0,-90,110,[[0,'#F4F8FE'],[0.7,'#D9E4F2'],[1,'#B9C9DE']]);
    ctx.beginPath(); ctx.roundRect(-88,-140,176,150,36); ctx.fill();
    ctx.fillStyle='#FFD34D'; ctx.beginPath(); ctx.roundRect(-30,-108,60,52,14); ctx.fill();
    h.P(function(){ ctx.moveTo(-8,-96); ctx.lineTo(16,-82); ctx.lineTo(-8,-68); },'#7A5A10');
    ctx.save(); ctx.translate(-112,-118); ctx.rotate(0.3+(p.armL||0)); h.ell(0,18,24,46,'#C9D8EC'); ctx.restore();
    ctx.save(); ctx.translate( 112,-118); ctx.rotate(-0.3-(p.armR||0)); h.ell(0,18,24,46,'#C9D8EC'); ctx.restore();
    ctx.fillStyle='#8A9AB8';
    ctx.beginPath(); ctx.roundRect(-64+(p.legL||0),-2,44,24,10); ctx.fill();
    ctx.beginPath(); ctx.roundRect( 20+(p.legR||0),-2,44,24,10); ctx.fill();
    rim(ctx,h,0,hb,112);
  };

  BODY.mundol = function(ctx,h,p){
    var tw=(p.tail||0);
    for(var i=0;i<5;i++){
      var bx=-96+i*48, sw=((i%2)?1:-1)*(14+tw*14);
      (function(bx,sw){
        h.P(function(){ ctx.moveTo(bx-15,-100);
          ctx.bezierCurveTo(bx-15+sw,-40, bx-15-sw,-6, bx-6+sw,16);
          ctx.quadraticCurveTo(bx+10+sw,26, bx+18+sw,10);
          ctx.bezierCurveTo(bx+24-sw,-14, bx+18+sw,-56, bx+15,-100); },'#B58AD6');
        h.ell(bx+2+sw*0.6,8,7,5,'#D9B8F0');
      })(bx,sw);
    }
    var hb=-200+(p.bob||0);
    h.ell(0,hb,118,128,h.rg(0,hb,128,[[0,'#D9B8F0'],[0.7,'#B58AD6'],[1,'#8F62B4']]));
    h.ell(-58,hb-100,16,10,'#C9A2E4',0.5); h.ell(58,hb-100,16,10,'#C9A2E4',-0.5);
    faceEyes(ctx,h,0,hb-12,44,32,40,['#5A3A78','#241040'],p);
    blush(h,0,hb+38,84,20);
    mouthFor(ctx,h,0,hb+44,p,'#6E4692');
    rim(ctx,h,0,hb,120);
  };

  /* ── 공개 API ── */
  function draw(ctx,id,pose){
    var p = pose||{};
    var body = BODY[id]; if(!body) return false;
    var x = (p.x!==undefined)?p.x:450, y=(p.y!==undefined)?p.y:560, s=(p.s!==undefined)?p.s:1;
    var jump = p.jump||0;
    var h = mk(ctx);
    /* 그림자: 지면에, 점프 높이만큼 옅고 작게 */
    var sh = Math.max(0.35,1-jump/260);
    h.ell(x, y+22, 150*s*sh, 26*s*sh, 'rgba(100,80,60,'+(0.17*sh)+')');
    ctx.save();
    ctx.translate(x, y-jump);
    ctx.rotate(p.tilt||0);
    ctx.scale(s,s);
    body(ctx,h,p);
    ctx.restore();
    return true;
  }

  var API = { CHARS:CHARS, findChar:findChar, draw:draw };
  if(typeof module!=='undefined' && module.exports){ module.exports = API; }
  return API;
})();
