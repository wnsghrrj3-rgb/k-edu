/* ============================================================================
   K-edu 케이아트 — 살아나는 무대 엔진 (livestage-core.js)
   ----------------------------------------------------------------------------
   한 곳에서만 정의하고 두 곳에서 쓴다.
     1) /labs/livestage.html      — 혼자 그리고 혼자 보는 무대
     2) /kple/games/live-stage.js — 반 전체가 한 무대에 모이는 케이플 게임

   3계층:
     LiveStage.*      순수 로직 (node 테스트 대상 · 캔버스 없이 돈다)
     LiveStage.art.*  무대 배경 렌더러 (캔버스 ctx를 받아 그리기만)
     LiveStage.ink.*  획 벡터 ↔ 스프라이트 (브라우저 전용 · 호출 시에만 DOM 사용)

   획 벡터가 전송 단위인 이유:
     PNG를 통째 보내면 한 명당 수십 KB. 획은 정규화 좌표(0~1000 정수)라 훨씬 가볍고,
     폰 화면 크기가 제각각이어도 전자칠판에서 같은 그림이 된다. (co_draw 규약 계승)
   ============================================================================ */
(function (root, factory) {
  var API = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.LiveStage = API;
})(this, function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     1. 순수 로직
     ══════════════════════════════════════════════════════════════ */

  var MAX_BEINGS = 40;          // 한 무대 정원 (한 반 규모 + 여유)
  var SPRITE_MAX_W = 150;
  var SPRITE_MAX_H = 110;

  var PAD_W = 660, PAD_H = 500; // 그리기 화폭 기준 비율 (폰·PC 공통 4:3 근사)

  /* 획 전송 상한 — 한 명이 보내는 메시지가 무한정 커지지 않게 */
  var INK_MAX_STROKES = 80;
  var INK_MAX_PTS_PER_STROKE = 120;
  var INK_MAX_PTS_TOTAL = 2000;
  var INK_MIN_STEP = 6;         // 정규화(0~1000) 좌표에서 이만큼 움직여야 점을 새로 찍는다

  var STAGES = [
    { id:'sea',    name:'바다',  emoji:'🌊', def:'swim',  floor:0.040, bubbles:true  },
    { id:'sky',    name:'하늘',  emoji:'☁️', def:'fly',   floor:0.026, bubbles:false },
    { id:'forest', name:'숲',    emoji:'🌲', def:'hop',   floor:0.070, bubbles:false },
    { id:'space',  name:'우주',  emoji:'🚀', def:'float', floor:0.056, bubbles:false },
    { id:'winter', name:'겨울',  emoji:'⛄', def:'hop',   floor:0.100, bubbles:false }
  ];
  function findStage(id){ for(var i=0;i<STAGES.length;i++) if(STAGES[i].id===id) return STAGES[i]; return null; }

  var MOTIONS = [
    { id:'auto',  name:'자동', emoji:'✨' },
    { id:'swim',  name:'헤엄', emoji:'🐟' },
    { id:'fly',   name:'훨훨', emoji:'🦋' },
    { id:'hop',   name:'콩콩', emoji:'🐰' },
    { id:'float', name:'둥둥', emoji:'🎈' }
  ];
  function resolveMotion(sel, stageId){
    if(sel && sel!=='auto') return sel;
    var s = findStage(stageId);
    return s ? s.def : 'swim';
  }
  function floorOf(stageId, H){
    var s = findStage(stageId);
    return H - Math.round(H * (s ? s.floor : 0.04));
  }

  /* 알파만 보고 그려진 영역 찾기 — 캔버스 없이도 테스트되도록 접근자를 받는다 */
  function trimBounds(alphaAt, w, h, opts){
    opts = opts || {};
    var step = opts.step || 2, thr = opts.threshold==null ? 10 : opts.threshold, pad = opts.pad==null ? 6 : opts.pad;
    var minX=w, minY=h, maxX=-1, maxY=-1, found=false;
    for(var y=0;y<h;y+=step) for(var x=0;x<w;x+=step){
      if(alphaAt(x,y) > thr){
        found=true;
        if(x<minX)minX=x; if(x>maxX)maxX=x;
        if(y<minY)minY=y; if(y>maxY)maxY=y;
      }
    }
    if(!found) return null;
    minX=Math.max(0,minX-pad); minY=Math.max(0,minY-pad);
    maxX=Math.min(w-1,maxX+pad); maxY=Math.min(h-1,maxY+pad);
    return { x:minX, y:minY, w:maxX-minX+1, h:maxY-minY+1 };
  }

  function fitSize(w, h, maxW, maxH){
    maxW = maxW || SPRITE_MAX_W; maxH = maxH || SPRITE_MAX_H;
    var s = Math.min(maxW/w, maxH/h, 1);
    return { w:w*s, h:h*s, scale:s };
  }

  /* ── 획 벡터 ──
     stroke = { c:'#RRGGBB' 또는 'e'(지우개), w:굵기(0~1000 정규화), p:[x,y,x,y,...] (0~1000 정수) }
     보내기 전에 반드시 clampArt를 통과시킨다. 받는 쪽도 한 번 더 통과시킨다(신뢰 0). */
  function clampArt(art){
    if(!art || !art.s || !art.s.length) return null;
    var out = [], total = 0;
    for(var i=0;i<art.s.length && out.length<INK_MAX_STROKES; i++){
      var st = art.s[i];
      if(!st || !st.p || st.p.length < 2) continue;
      var pts = [];
      for(var j=0;j+1<st.p.length && pts.length < INK_MAX_PTS_PER_STROKE*2 && total < INK_MAX_PTS_TOTAL*2; j+=2){
        var x = st.p[j], y = st.p[j+1];
        if(typeof x!=='number' || typeof y!=='number') continue;
        if(!isFinite(x) || !isFinite(y)) continue;          // NaN·Infinity = 그림이 아니다
        pts.push(Math.max(0, Math.min(1000, Math.round(x))));
        pts.push(Math.max(0, Math.min(1000, Math.round(y))));
        total += 2;
      }
      if(pts.length < 2) continue;
      var c = (st.c === 'e') ? 'e' : (/^#[0-9a-fA-F]{6}$/.test(String(st.c)) ? String(st.c) : '#2B3A4A');
      var w = Math.max(1, Math.min(200, Number(st.w) || 20));
      out.push({ c:c, w:w, p:pts });
    }
    if(!out.length) return null;
    return {
      s: out,
      m: (['auto','swim','fly','hop','float'].indexOf(art.m)>=0) ? art.m : 'auto',
      f: (art.f === -1) ? -1 : 1
    };
  }

  /* 획 하나를 더 찍을지 — 손이 조금 움직인 정도는 버려서 메시지를 가볍게 */
  function shouldAddPoint(lastX, lastY, x, y){
    if(!isFinite(x) || !isFinite(y)) return false;          // 깨진 좌표는 애초에 안 찍는다
    if(lastX==null || !isFinite(lastX) || !isFinite(lastY)) return true;
    var dx = x-lastX, dy = y-lastY;
    return (dx*dx + dy*dy) >= INK_MIN_STEP*INK_MIN_STEP;
  }

  function inkSize(art){
    if(!art || !art.s) return 0;
    var n = 0;
    for(var i=0;i<art.s.length;i++) n += art.s[i].p.length;
    return n;
  }

  /* ── 그림 친구(개체) ── */
  function createBeing(o){
    o = o || {};
    var rnd = o.rnd || Math.random;
    var size = fitSize(o.w||100, o.h||80);
    return {
      id: o.id || 0,
      name: (o.name||'').slice(0,8),
      mode: o.mode || 'swim',
      face: o.face === -1 ? -1 : 1,
      w: size.w, h: size.h,
      x: o.x==null ? -80 : o.x,
      y: o.y==null ? 100 : o.y,
      dir: 1,
      speed: o.speed==null ? (0.6 + rnd()*0.8) : o.speed,
      ph: rnd()*6, amp: 10 + rnd()*14, freq: 0.8 + rnd()*0.8,
      vx: (rnd()-0.5)*0.8, vy: 0, rot: 0, rotV: (rnd()-0.5)*0.008,
      restT: 0, target: null, scare: 0, age: 0, eaten: 0
    };
  }

  function createPelletField(){
    var list = [];
    return {
      list: function(){ return list; },
      count: function(){ return list.length; },
      drop: function(x, y){ var p={x:x, y:Math.min(y,40), vy:0.35, wob:Math.random()*6}; list.push(p); return p; },
      remove: function(p){ var i=list.indexOf(p); if(i>=0) list.splice(i,1); return i>=0; },
      step: function(dt, floorY, t){
        for(var i=list.length-1;i>=0;i--){
          var p=list[i];
          p.y += p.vy*dt;
          p.x += Math.sin(t*3 + p.wob)*0.3;
          if(p.y > floorY-6) list.splice(i,1);
        }
      },
      clear: function(){ list.length=0; }
    };
  }

  function pickTarget(b, pellets, range){
    range = range==null ? 260 : range;
    var best=null, bd=range*range;
    for(var i=0;i<pellets.length;i++){
      var p=pellets[i], d=(p.x-b.x)*(p.x-b.x) + (p.y-b.y)*(p.y-b.y);
      if(d<bd){ bd=d; best=p; }
    }
    return best;
  }

  /* 움직임 물리 — 우선순위 ①놀람 ②먹이 ③평소 */
  function stepBeing(b, env){
    var dt = env.dt, t = env.t, W = env.W, floorY = env.floorY;
    b.age += dt;

    if(b.scare<=0 && env.pellets && env.pellets.length){
      if(!b.target || env.pellets.indexOf(b.target)<0) b.target = pickTarget(b, env.pellets);
    } else if(b.target && (!env.pellets || env.pellets.indexOf(b.target)<0)) {
      b.target = null;
    }

    if(b.scare>0){
      b.scare -= dt*0.03;
      b.target = null;
      b.x += b.dir * b.speed * 5 * dt;
      if(b.mode==='hop'){ if(b.vy>=0) b.vy = -5; }
      else b.y += Math.sin(t*9 + b.ph)*2;

    } else if(b.target){
      var dx = b.target.x - b.x, dy = b.target.y - b.y;
      var d = Math.sqrt(dx*dx + dy*dy) || 1;
      b.dir = dx>=0 ? 1 : -1;
      b.x += dx/d * b.speed * 2.4 * dt;
      if(b.mode==='hop'){
        if(b.restT<=0 && b.y >= floorY - b.h/2 - 1){ b.vy = -5.5; b.restT = 0.2; }
      } else {
        b.y += dy/d * b.speed * 2.4 * dt;
      }
      if(d < 20){
        var p = b.target;
        b.target = null; b.eaten++;
        if(env.onEat) env.onEat(p, b);
      }

    } else {
      switch(b.mode){
        case 'swim':
          b.x += b.dir * b.speed * dt;
          b.y += Math.sin(t*b.freq + b.ph) * b.amp * 0.016 * dt * 16;
          break;
        case 'fly':
          b.x += b.dir * b.speed * 1.3 * dt;
          b.y += (Math.sin(t*b.freq*1.5 + b.ph) * b.amp * 0.03 + Math.sin(t*0.4 + b.ph)*0.6) * dt * 8;
          break;
        case 'float':
          b.x += b.vx * dt;
          b.y += Math.sin(t*0.6 + b.ph) * 0.4 * dt * 4;
          b.rot += b.rotV * dt * 16;
          b.dir = b.vx>=0 ? 1 : -1;
          break;
      }
    }

    if(b.mode==='hop'){
      b.vy += 0.25*dt;
      b.y  += b.vy * dt * 3;
      var gy = floorY - b.h/2;
      if(b.y >= gy){ b.y = gy; b.vy = 0; }
      b.restT -= dt/60;
      var grounded = (b.y >= gy - 1);
      if(grounded && b.restT<=0 && b.scare<=0 && !b.target){
        b.vy = -(3.5 + Math.random()*2);
        b.restT = 0.5 + Math.random()*1.1;
        if(Math.random()<0.25) b.dir *= -1;
      }
      if(!grounded) b.x += b.dir * b.speed * 1.6 * dt;
    }

    var m = b.w/2 + 10;
    if(b.x > W - m){ b.dir = -1; if(b.mode==='float') b.vx = -Math.abs(b.vx) || -0.4; }
    if(b.x < m && b.age > 120){ b.dir = 1; if(b.mode==='float') b.vx = Math.abs(b.vx) || 0.4; }

    var topM = b.h/2 + 8;
    var botM = (b.mode==='swim') ? floorY - 24 - b.h/2 : floorY - b.h/2;
    if(botM < topM) botM = topM;
    if(b.y < topM) b.y = topM;
    if(b.y > botM) b.y = botM;
    return b;
  }

  /* ── 무대 운영 ── */
  function createStageRun(opts){
    opts = opts || {};
    var stageId = opts.stage || 'sea';
    var beings = [];
    var seq = 0;
    var byName = {};                                  // 케이플: 한 사람이 한 마리 (다시 보내면 교체)
    var pellets = createPelletField();

    function drop(b){
      var i = beings.indexOf(b);
      if(i>=0) beings.splice(i,1);
      if(b.name && byName[b.name]===b) delete byName[b.name];
    }
    return {
      stage: function(){ return stageId; },
      setStage: function(id){ if(findStage(id)){ stageId=id; pellets.clear(); return true; } return false; },
      pellets: pellets,
      beings: function(){ return beings; },
      count: function(){ return beings.length; },
      full: function(){ return beings.length >= MAX_BEINGS; },
      byName: function(n){ return byName[n] || null; },
      add: function(o){
        o = o || {};
        if(o.unique && o.name && byName[o.name]) drop(byName[o.name]);   // 같은 사람이 다시 보내면 갈아탄다
        if(beings.length >= MAX_BEINGS) drop(beings[0]);                 // 정원 초과 = 최고참 퇴장
        o.id = ++seq;
        o.mode = resolveMotion(o.motionSel, stageId);
        var b = createBeing(o);
        beings.push(b);
        if(o.unique && b.name) byName[b.name] = b;
        return b;
      },
      remove: drop,
      hitTest: function(x, y){
        for(var i=beings.length-1;i>=0;i--){
          var b=beings[i];
          if(Math.abs(b.x-x) < b.w/2 && Math.abs(b.y-y) < b.h/2) return b;
        }
        return null;
      },
      clear: function(){ beings.length=0; byName={}; pellets.clear(); },
      totalEaten: function(){ var n=0; for(var i=0;i<beings.length;i++) n+=beings[i].eaten; return n; }
    };
  }

  /* ══════════════════════════════════════════════════════════════
     2. 무대 배경 렌더러 — 전부 절차 생성(외부 에셋 0)
     ══════════════════════════════════════════════════════════════ */
  var art = (function(){
    function R(a,b){ return a + Math.random()*(b-a); }

    function makeDecor(){
      return {
        sea:{
          rocks: Array.from({length:5}, function(_,i){ return {x:i*0.22+R(0,0.08), w:R(0.14,0.26), h:R(0.12,0.30)}; }),
          corals: Array.from({length:5}, function(_,i){ return {x:i*0.2+R(0.02,0.1), branch:i%2===1, s:R(0.7,1.25),
                    c:['#FF7E67','#FF9E5C','#F06292','#BA68C8','#FFB74D'][i%5], ph:R(0,6)}; }),
          anems: [{x:0.16,c:'#F48FB1',n:9,ph:1},{x:0.62,c:'#CE93D8',n:11,ph:3},{x:0.88,c:'#80DEEA',n:8,ph:5}],
          weeds: Array.from({length:7}, function(_,i){ return {x:0.04+i*0.14+R(0,0.05), h:R(0.18,0.34), ph:R(0,6),
                    c: i%2 ? 'rgba(38,150,100,.9)' : 'rgba(28,120,90,.75)'}; }),
          pebbles: Array.from({length:10}, function(){ return {x:Math.random(), r:R(3,9), c:'hsl('+R(30,50)+',25%,'+R(45,65)+'%)'}; }),
          stars: [{x:0.30,c:'#FF8A65'},{x:0.74,c:'#FFD54F'}],
          dust: Array.from({length:40}, function(){ return {x:Math.random(), y:Math.random(), r:R(0.6,1.8), v:R(0.05,0.2), ph:R(0,6)}; }),
          school: Array.from({length:8}, function(){ return {ox:R(-40,40), oy:R(-24,24), s:R(0.6,1)}; }),
          sx:-200, sdir:1, sy:0.3
        },
        sky:{
          clouds: Array.from({length:7}, function(_,i){ return {x:Math.random(), y:R(0.08,0.6), s:R(0.6,1.4), v:R(0.1,0.35), far:i<3}; }),
          seeds: Array.from({length:18}, function(){ return {x:Math.random(), y:Math.random(), ph:R(0,6), v:R(0.1,0.3)}; }),
          birds: Array.from({length:5}, function(){ return {ox:R(-50,50), oy:R(-20,20), s:R(0.5,0.9)}; }),
          bx:-150, bdir:1, by:0.25
        },
        forest:{
          trunks: [{x:0.06,w:0.05},{x:0.90,w:0.06},{x:0.42,w:0.04}],
          bushes: Array.from({length:6}, function(_,i){ return {x:i*0.18+R(0,0.06), r:R(0.05,0.10), c: i%2?'#4C8C46':'#3D7A3A'}; }),
          flowers: Array.from({length:9}, function(){ return {x:Math.random(), c:['#FF6B8A','#FFD23C','#B06CF0','#FF9D3C'][Math.floor(R(0,4))], ph:R(0,6)}; }),
          shrooms: [{x:0.24},{x:0.68}],
          leaves: Array.from({length:14}, function(){ return {x:Math.random(), y:Math.random(), ph:R(0,6), v:R(0.15,0.4), r:R(3,6)}; }),
          rays: [0.25,0.55,0.80]
        },
        space:{
          stars: Array.from({length:80}, function(){ return {x:Math.random(), y:Math.random()*0.92, r:R(0.5,1.8), ph:R(0,6)}; }),
          craters: Array.from({length:6}, function(){ return {x:Math.random(), r:R(8,22)}; }),
          shots: []
        },
        winter:{
          snow: Array.from({length:70}, function(){ return {x:Math.random(), y:Math.random(), r:R(1,3.2), v:R(0.3,0.9), ph:R(0,6)}; }),
          pines: [{x:0.10,s:1},{x:0.22,s:0.7},{x:0.86,s:1.1},{x:0.72,s:0.65}]
        }
      };
    }

    var FOOD = {
      sea:   ['#F4B04C','#C07F28'], sky:   ['#FFD54F','#C9A227'], forest:['#A1701F','#6F4A10'],
      space: ['#E6EE9C','#9AA23C'], winter:['#FFAB91','#C26A4A']
    };

    function grad(ctx, W, H, stops){
      var g = ctx.createLinearGradient(0,0,0,H);
      stops.forEach(function(s){ g.addColorStop(s[0], s[1]); });
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    }
    function vignette(ctx, W, H, a){
      if(a<=0) return;
      var vg = ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.4, W/2,H/2,Math.max(W,H)*0.75);
      vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,10,30,'+a+')');
      ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
    }
    function ground(ctx, W, H, y, back, front, amp){
      ctx.fillStyle = back;
      ctx.beginPath(); ctx.moveTo(0,H);
      for(var x=0;x<=W;x+=40) ctx.lineTo(x, y-14-Math.sin(x*0.015)*amp);
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = front;
      ctx.beginPath(); ctx.moveTo(0,H);
      for(var x2=0;x2<=W;x2+=40) ctx.lineTo(x2, y-Math.sin(x2*0.02+1)*6);
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
    }

    function sea(ctx, e){
      var W=e.W, H=e.H, t=e.t, dt=e.dt, fy=e.floorY, d=e.decor.sea;
      grad(ctx, W, H, [[0,'#3DB8DC'],[0.25,'#1A7FB0'],[0.6,'#0C4F7E'],[1,'#03243F']]);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for(var i=0;i<7;i++){
        var cx = (i/7)*W + Math.sin(t*0.8 + i*1.7)*30, cy = 14 + Math.sin(t*1.3+i)*6;
        var cg = ctx.createRadialGradient(cx,cy,0,cx,cy,60);
        cg.addColorStop(0,'rgba(180,240,255,.14)'); cg.addColorStop(1,'rgba(180,240,255,0)');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(cx,cy,60,16,0,0,7); ctx.fill();
      }
      for(var j=0;j<4;j++){
        var bx = W*(0.12 + j*0.24) + Math.sin(t*0.25 + j*2)*50;
        var lg = ctx.createLinearGradient(bx,0,bx+90,H);
        lg.addColorStop(0,'rgba(200,240,255,.16)'); lg.addColorStop(1,'rgba(200,240,255,0)');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.moveTo(bx-24,0); ctx.lineTo(bx+24,0); ctx.lineTo(bx+150,H); ctx.lineTo(bx+30,H); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      d.rocks.forEach(function(r){
        ctx.fillStyle = 'rgba(5,30,55,.55)';
        ctx.beginPath(); ctx.ellipse(r.x*W + r.w*W/2, fy, r.w*W/2, r.h*H, 0, Math.PI, 0); ctx.fill();
      });
      d.sx += d.sdir*0.9*dt;
      if(d.sx > W+220){ d.sdir = -1; d.sy = R(0.2,0.5); }
      if(d.sx < -220){ d.sdir = 1;  d.sy = R(0.2,0.5); }
      d.school.forEach(function(f,i){
        var x = d.sx + f.ox*d.sdir, y = d.sy*H + f.oy + Math.sin(t*2+i)*3;
        ctx.save(); ctx.translate(x,y); ctx.scale(d.sdir*f.s, f.s);
        ctx.fillStyle = 'rgba(10,40,70,.5)';
        ctx.beginPath(); ctx.ellipse(0,0,10,4,0,0,7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(-15,-4); ctx.lineTo(-15,4); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      d.dust.forEach(function(p){
        var py = (p.y*H - t*p.v*20) % H; if(py<0) py += H;
        ctx.fillStyle = 'rgba(220,245,255,.25)';
        ctx.beginPath(); ctx.arc(p.x*W + Math.sin(t*0.5+p.ph)*8, py, p.r, 0, 7); ctx.fill();
      });
      ground(ctx, W, H, fy, '#B89A63', '#E8CF8F', 8);
      d.pebbles.forEach(function(p){
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(p.x*W, fy+2, p.r, p.r*0.6, 0, 0, 7); ctx.fill();
      });
      d.corals.forEach(function(c){
        var sway = Math.sin(t*1.2 + c.ph)*0.5, x = c.x*W;
        if(c.branch){
          ctx.strokeStyle = c.c; ctx.lineCap = 'round';
          for(var i2=0;i2<5;i2++){
            var a = -Math.PI/2 + (i2-2)*0.42, len = (34 + (i2%2)*16)*c.s;
            ctx.lineWidth = 7*c.s;
            var mx = x + Math.cos(a)*len*0.5 + sway*4, my = fy+2 + Math.sin(a)*len*0.5;
            ctx.beginPath(); ctx.moveTo(x, fy+2);
            ctx.quadraticCurveTo(mx, my, x + Math.cos(a)*len + sway*8, fy+2 + Math.sin(a)*len); ctx.stroke();
            ctx.lineWidth = 4.5*c.s;
            ctx.beginPath(); ctx.moveTo(mx,my);
            ctx.lineTo(mx + Math.cos(a-0.7)*13*c.s + sway*4, my + Math.sin(a-0.7)*13*c.s); ctx.stroke();
          }
        } else {
          ctx.fillStyle = c.c;
          ctx.beginPath(); ctx.arc(x, fy+2, 26*c.s, Math.PI, 0); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 2*c.s;
          for(var k=1;k<4;k++){ ctx.beginPath(); ctx.arc(x, fy+2, 26*c.s*k/4, Math.PI+0.3, -0.3); ctx.stroke(); }
        }
      });
      d.anems.forEach(function(a2){
        var x = a2.x*W, sway = Math.sin(t*1.4 + a2.ph);
        ctx.strokeStyle = a2.c; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for(var i3=0;i3<a2.n;i3++){
          var ang = -Math.PI/2 + (i3-(a2.n-1)/2)*0.28, len2 = 22 + Math.sin(t*2+i3)*3;
          ctx.beginPath(); ctx.moveTo(x, fy);
          ctx.quadraticCurveTo(x + Math.cos(ang)*len2*0.5 + sway*3, fy + Math.sin(ang)*len2*0.5,
                               x + Math.cos(ang)*len2 + sway*7,     fy + Math.sin(ang)*len2);
          ctx.stroke();
        }
        ctx.fillStyle = a2.c; ctx.beginPath(); ctx.ellipse(x, fy+3, 12, 7, 0, 0, 7); ctx.fill();
      });
      d.stars.forEach(function(s){
        ctx.fillStyle = s.c; ctx.save(); ctx.translate(s.x*W, fy+4); ctx.rotate(0.4);
        ctx.beginPath();
        for(var i4=0;i4<5;i4++){
          var a1 = i4*2*Math.PI/5 - Math.PI/2, a3 = a1 + Math.PI/5;
          ctx.lineTo(Math.cos(a1)*11, Math.sin(a1)*11);
          ctx.lineTo(Math.cos(a3)*4.5, Math.sin(a3)*4.5);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
      });
      d.weeds.forEach(function(w){
        var bx2 = w.x*W, sway2 = Math.sin(t*1.1 + w.ph), hh = w.h*H;
        ctx.strokeStyle = w.c; ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx2, fy);
        ctx.quadraticCurveTo(bx2 + sway2*10, fy - hh*0.55, bx2 + sway2*24, fy - hh); ctx.stroke();
      });
      return 0.35;
    }

    function sky(ctx, e){
      var W=e.W, H=e.H, t=e.t, dt=e.dt, d=e.decor.sky;
      grad(ctx, W, H, [[0,'#4AA8E8'],[0.5,'#8FD0F4'],[0.85,'#D8F0FB'],[1,'#E8F7D8']]);
      var sx = W*0.84, sy = H*0.14;
      var sg = ctx.createRadialGradient(sx,sy,0,sx,sy,90);
      sg.addColorStop(0,'rgba(255,236,150,.95)'); sg.addColorStop(0.4,'rgba(255,220,110,.5)'); sg.addColorStop(1,'rgba(255,220,110,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx,sy,90,0,7); ctx.fill();
      ctx.fillStyle = '#FFE082'; ctx.beginPath(); ctx.arc(sx,sy,26,0,7); ctx.fill();

      d.bx += d.bdir*1.1*dt;
      if(d.bx > W+180){ d.bdir = -1; d.by = R(0.12,0.4); }
      if(d.bx < -180){ d.bdir = 1;  d.by = R(0.12,0.4); }
      d.birds.forEach(function(b,i){
        var x = d.bx + b.ox*d.bdir, y = d.by*H + b.oy, flap = Math.sin(t*8+i)*5*b.s;
        ctx.strokeStyle = 'rgba(40,60,80,.55)'; ctx.lineWidth = 2*b.s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x-8*b.s, y-flap);
        ctx.quadraticCurveTo(x, y+3*b.s, x+8*b.s, y-flap); ctx.stroke();
      });
      d.clouds.forEach(function(c){
        c.x += c.v*dt*(c.far?0.4:1)/W*60;
        if(c.x > 1.2) c.x = -0.2;
        var x = c.x*W, y = c.y*H, s = c.s*(c.far?0.7:1);
        ctx.fillStyle = 'rgba(255,255,255,' + (c.far?0.5:0.9) + ')';
        [[0,0,34],[26,6,24],[-26,6,24],[10,-12,22],[-12,-10,20]].forEach(function(p){
          ctx.beginPath(); ctx.arc(x+p[0]*s, y+p[1]*s, p[2]*s, 0, 7); ctx.fill();
        });
      });
      [{c:'#7FB069',h:0.16,ph:0},{c:'#5E9C56',h:0.10,ph:2}].forEach(function(hl){
        ctx.fillStyle = hl.c;
        ctx.beginPath(); ctx.moveTo(0,H);
        for(var x=0;x<=W;x+=30) ctx.lineTo(x, H - hl.h*H - Math.sin(x*0.008 + hl.ph)*14);
        ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
      });
      d.seeds.forEach(function(s){
        var y = (s.y*H - t*s.v*26) % H; if(y<0) y += H;
        var x = s.x*W + Math.sin(t*0.7 + s.ph)*22;
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1;
        for(var i=0;i<5;i++){
          var a = i*Math.PI*2/5 + t*0.3;
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x + Math.cos(a)*5, y + Math.sin(a)*5); ctx.stroke();
        }
      });
      return 0.12;
    }

    function forest(ctx, e){
      var W=e.W, H=e.H, t=e.t, fy=e.floorY, d=e.decor.forest;
      grad(ctx, W, H, [[0,'#9CCF6A'],[0.4,'#5EA24E'],[1,'#2C5E30']]);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      d.rays.forEach(function(r,i){
        var bx = r*W + Math.sin(t*0.2 + i)*20;
        var lg = ctx.createLinearGradient(bx,0,bx+60,H);
        lg.addColorStop(0,'rgba(255,250,190,.2)'); lg.addColorStop(1,'rgba(255,250,190,0)');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.moveTo(bx-18,0); ctx.lineTo(bx+18,0); ctx.lineTo(bx+110,H); ctx.lineTo(bx+20,H); ctx.closePath(); ctx.fill();
      });
      ctx.restore();
      d.trunks.forEach(function(tr){
        var x = tr.x*W, w = tr.w*W;
        ctx.fillStyle = '#5B4230'; ctx.fillRect(x, 0, w, fy+6);
        ctx.fillStyle = 'rgba(60,40,25,.4)'; ctx.fillRect(x + w*0.65, 0, w*0.35, fy+6);
      });
      ctx.fillStyle = 'rgba(35,90,45,.85)';
      for(var x2=0;x2<=W;x2+=60){
        ctx.beginPath(); ctx.arc(x2, -10 + Math.sin(x2)*8, 55 + Math.sin(x2*0.7)*15, 0, 7); ctx.fill();
      }
      ctx.fillStyle = '#3A7A38';
      ctx.beginPath(); ctx.moveTo(0,H);
      for(var x3=0;x3<=W;x3+=30) ctx.lineTo(x3, fy-4-Math.sin(x3*0.03)*5);
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
      d.bushes.forEach(function(b){
        ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x*W, fy+2, b.r*H, Math.PI, 0); ctx.fill();
      });
      d.flowers.forEach(function(f){
        var x = f.x*W, sway = Math.sin(t*1.3 + f.ph)*2;
        ctx.strokeStyle = '#2F6B35'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, fy+4); ctx.lineTo(x+sway, fy-12); ctx.stroke();
        ctx.fillStyle = f.c;
        for(var i=0;i<5;i++){
          var a = i*Math.PI*2/5;
          ctx.beginPath(); ctx.arc(x + sway + Math.cos(a)*4, fy-14 + Math.sin(a)*4, 3, 0, 7); ctx.fill();
        }
        ctx.fillStyle = '#FFF59D'; ctx.beginPath(); ctx.arc(x+sway, fy-14, 2.4, 0, 7); ctx.fill();
      });
      d.shrooms.forEach(function(m){
        var x = m.x*W;
        ctx.fillStyle = '#F3E6C8'; ctx.fillRect(x-3, fy-10, 6, 12);
        ctx.fillStyle = '#E05A4A'; ctx.beginPath(); ctx.arc(x, fy-10, 10, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x-4, fy-14, 1.8, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x+4, fy-13, 1.6, 0, 7); ctx.fill();
      });
      d.leaves.forEach(function(l){
        var y = (l.y*H + t*l.v*30) % H;
        var x = l.x*W + Math.sin(t*1.2 + l.ph)*26;
        ctx.fillStyle = 'rgba(180,220,90,.85)';
        ctx.save(); ctx.translate(x,y); ctx.rotate(Math.sin(t*2 + l.ph));
        ctx.beginPath(); ctx.ellipse(0,0,l.r,l.r*0.5,0,0,7); ctx.fill(); ctx.restore();
      });
      return 0.22;
    }

    function space(ctx, e){
      var W=e.W, H=e.H, t=e.t, dt=e.dt, fy=e.floorY, d=e.decor.space;
      grad(ctx, W, H, [[0,'#050514'],[0.5,'#0D0D30'],[1,'#1A1040']]);
      d.stars.forEach(function(s){
        var tw = 0.4 + Math.sin(t*2 + s.ph)*0.35;
        ctx.fillStyle = 'rgba(255,255,255,' + tw + ')';
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, 7); ctx.fill();
      });
      var gx = W*0.2, gy = H*0.22;
      var gg = ctx.createRadialGradient(gx,gy,0,gx,gy,70);
      gg.addColorStop(0,'rgba(200,150,255,.35)'); gg.addColorStop(0.6,'rgba(120,90,220,.15)'); gg.addColorStop(1,'rgba(120,90,220,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(gx,gy,70,34,0.5,0,7); ctx.fill();

      var px = W*0.78, py = H*0.24;
      ctx.fillStyle = '#E8A25C'; ctx.beginPath(); ctx.arc(px,py,34,0,7); ctx.fill();
      ctx.fillStyle = 'rgba(200,120,60,.5)';
      ctx.beginPath(); ctx.arc(px-10,py-6,10,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(px+12,py+10,7,0,7); ctx.fill();
      ctx.strokeStyle = 'rgba(240,220,170,.8)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(px,py,56,14,-0.3,0,7); ctx.stroke();

      if(Math.random() < 0.004) d.shots.push({x:R(0,W), y:R(0,H*0.4), vx:R(3,5), vy:R(1.4,2.4), a:1});
      for(var i=d.shots.length-1;i>=0;i--){
        var s2 = d.shots[i];
        s2.x += s2.vx*dt; s2.y += s2.vy*dt; s2.a -= 0.015*dt;
        ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(s2.a,0) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(s2.x - s2.vx*8, s2.y - s2.vy*8); ctx.stroke();
        if(s2.a <= 0) d.shots.splice(i,1);
      }
      ctx.fillStyle = '#B9BECE';
      ctx.beginPath(); ctx.moveTo(0,H);
      for(var x=0;x<=W;x+=40) ctx.lineTo(x, fy - Math.sin(x*0.02)*5);
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
      d.craters.forEach(function(c){
        ctx.fillStyle = 'rgba(90,95,115,.55)';
        ctx.beginPath(); ctx.ellipse(c.x*W, fy+8, c.r, c.r*0.4, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(230,235,250,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(c.x*W, fy+8, c.r, c.r*0.4, 0, Math.PI, 0, true); ctx.stroke();
      });
      return 0;
    }

    function winter(ctx, e){
      var W=e.W, H=e.H, t=e.t, fy=e.floorY, d=e.decor.winter;
      grad(ctx, W, H, [[0,'#5B6FA8'],[0.45,'#94A8D0'],[0.8,'#D7DEF0'],[1,'#EEF2FA']]);
      var mx = W*0.16, my = H*0.16;
      var mg = ctx.createRadialGradient(mx,my,0,mx,my,70);
      mg.addColorStop(0,'rgba(255,250,220,.9)'); mg.addColorStop(0.4,'rgba(255,250,220,.3)'); mg.addColorStop(1,'rgba(255,250,220,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx,my,70,0,7); ctx.fill();
      ctx.fillStyle = '#FDF6DC'; ctx.beginPath(); ctx.arc(mx,my,22,0,7); ctx.fill();

      ctx.fillStyle = '#C9D6EE';
      ctx.beginPath(); ctx.moveTo(0,H);
      for(var x=0;x<=W;x+=40) ctx.lineTo(x, fy-26-Math.sin(x*0.008+2)*18);
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#F4F7FD';
      ctx.beginPath(); ctx.moveTo(0,H);
      for(var x2=0;x2<=W;x2+=40) ctx.lineTo(x2, fy - Math.sin(x2*0.012)*10);
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();

      d.pines.forEach(function(p){
        var x3 = p.x*W, base = fy-6, s = p.s;
        ctx.fillStyle = '#5B4230'; ctx.fillRect(x3-4*s, base-8*s, 8*s, 10*s);
        for(var i=0;i<3;i++){
          var w = (46-i*11)*s, h = 26*s, y = base - 8*s - i*20*s;
          ctx.fillStyle = '#2F6B46';
          ctx.beginPath(); ctx.moveTo(x3, y-h); ctx.lineTo(x3-w/2, y); ctx.lineTo(x3+w/2, y); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.9)';
          ctx.beginPath(); ctx.moveTo(x3, y-h); ctx.lineTo(x3-w*0.28, y-h*0.45); ctx.lineTo(x3+w*0.28, y-h*0.45); ctx.closePath(); ctx.fill();
        }
      });

      var hx = W*0.52, hy = fy-4;
      ctx.fillStyle = '#7A5638'; ctx.fillRect(hx-34, hy-40, 68, 40);
      ctx.fillStyle = '#4E3722';
      ctx.beginPath(); ctx.moveTo(hx-44,hy-40); ctx.lineTo(hx,hy-70); ctx.lineTo(hx+44,hy-40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.beginPath(); ctx.moveTo(hx-44,hy-40); ctx.lineTo(hx,hy-70); ctx.lineTo(hx+44,hy-40);
      ctx.lineTo(hx+38,hy-40); ctx.lineTo(hx,hy-63); ctx.lineTo(hx-38,hy-40); ctx.closePath(); ctx.fill();
      var glow = 0.75 + Math.sin(t*3)*0.15;
      ctx.fillStyle = 'rgba(255,205,90,' + glow + ')'; ctx.fillRect(hx-12, hy-28, 24, 18);
      ctx.strokeStyle = '#4E3722'; ctx.lineWidth = 2;
      ctx.strokeRect(hx-12, hy-28, 24, 18);
      ctx.beginPath(); ctx.moveTo(hx, hy-28); ctx.lineTo(hx, hy-10);
      ctx.moveTo(hx-12, hy-19); ctx.lineTo(hx+12, hy-19); ctx.stroke();
      for(var i2=0;i2<3;i2++){
        var sy2 = hy - 74 - i2*16 - ((t*12) % 16);
        ctx.fillStyle = 'rgba(230,230,240,' + (0.4 - i2*0.1) + ')';
        ctx.beginPath(); ctx.arc(hx + 26 + Math.sin(t+i2)*4, sy2, 6 + i2*2, 0, 7); ctx.fill();
      }
      d.snow.forEach(function(s){
        var y = (s.y*H + t*s.v*36) % H;
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.beginPath(); ctx.arc(s.x*W + Math.sin(t*0.8 + s.ph)*14, y, s.r, 0, 7); ctx.fill();
      });
      return 0.10;
    }

    var BG = { sea:sea, sky:sky, forest:forest, space:space, winter:winter };

    function drawStage(ctx, stageId, e){ return (BG[stageId] || sea)(ctx, e); }

    function drawFood(ctx, stageId, pellets){
      var f = FOOD[stageId] || FOOD.sea;
      pellets.forEach(function(p){
        ctx.fillStyle = f[0]; ctx.strokeStyle = f[1]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 7); ctx.fill(); ctx.stroke();
      });
    }

    /* 그림 친구 — 모드별 스쿼시·기울임으로 살아있는 느낌 */
    function drawBeing(ctx, b, t, opts){
      opts = opts || {};
      var sy = 1, tilt = 0;
      if(b.mode==='swim'){ tilt = Math.sin(t*b.freq*2 + b.ph)*0.07; sy = 1 + Math.sin(t*4 + b.ph)*0.03; }
      else if(b.mode==='fly'){ tilt = Math.sin(t*b.freq + b.ph)*0.06; sy = 1 + Math.sin(t*9 + b.ph)*0.10; }
      else if(b.mode==='hop'){ sy = b.vy < -0.5 ? 1.08 : (Math.abs(b.vy) < 0.01 ? 0.96 : 1); tilt = b.vy*0.02; }
      else if(b.mode==='float'){ tilt = b.rot; sy = 1 + Math.sin(t*2 + b.ph)*0.03; }

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(tilt * (b.scare>0 ? 2 : 1));
      ctx.scale(b.dir * b.face, sy);
      if(b.sprite) ctx.drawImage(b.sprite, -b.w/2, -b.h/2, b.w, b.h);
      ctx.restore();

      if(b.name){
        var fs = opts.nameSize || 12;
        ctx.font = "600 " + fs + "px 'Gowun Dodum', sans-serif";
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3;
        ctx.strokeText(b.name, b.x, b.y + b.h/2 + fs + 4);
        ctx.fillStyle = 'rgba(255,255,255,.92)';
        ctx.fillText(b.name, b.x, b.y + b.h/2 + fs + 4);
      }
    }

    function drawPops(ctx, pops, dt){
      for(var i=pops.length-1;i>=0;i--){
        var p = pops[i]; p.r += 0.8*dt; p.a -= 0.05*dt;
        ctx.strokeStyle = 'rgba(255,220,120,' + Math.max(p.a,0) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.stroke();
        if(p.a <= 0) pops.splice(i,1);
      }
    }

    function drawBubbles(ctx, bubbles, dt, W, floorY){
      if(Math.random() < 0.06) bubbles.push({x:Math.random()*W, y:floorY-4, r:2+Math.random()*4, v:0.4+Math.random()*0.8});
      for(var i=bubbles.length-1;i>=0;i--){
        var b = bubbles[i];
        b.y -= b.v*dt; b.x += Math.sin(b.y*0.05)*0.3;
        ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke();
        if(b.y < -10) bubbles.splice(i,1);
      }
    }

    return { makeDecor:makeDecor, drawStage:drawStage, drawFood:drawFood, drawBeing:drawBeing,
             drawPops:drawPops, drawBubbles:drawBubbles, vignette:vignette, FOOD:FOOD };
  })();

  /* ══════════════════════════════════════════════════════════════
     3. 획 ↔ 스프라이트 (브라우저 전용 — 호출할 때만 DOM을 쓴다)
     ══════════════════════════════════════════════════════════════ */
  var ink = {
    /* 획 벡터를 화폭에 재현 → 그림 부분만 잘라 스프라이트 캔버스로 */
    toSprite: function(art, opts){
      art = clampArt(art);
      if(!art) return null;
      opts = opts || {};
      var W = opts.padW || PAD_W, H = opts.padH || PAD_H;

      var pad = document.createElement('canvas');
      pad.width = W; pad.height = H;
      var c = pad.getContext('2d', { willReadFrequently:true });
      c.lineCap = c.lineJoin = 'round';

      art.s.forEach(function(st){
        var lw = Math.max(1, st.w / 1000 * W);
        c.globalCompositeOperation = (st.c === 'e') ? 'destination-out' : 'source-over';
        c.strokeStyle = (st.c === 'e') ? '#000' : st.c;
        c.lineWidth = (st.c === 'e') ? lw*2.2 : lw;
        c.beginPath();
        for(var i=0;i+1<st.p.length;i+=2){
          var x = st.p[i]/1000*W, y = st.p[i+1]/1000*H;
          if(i===0) c.moveTo(x,y); else c.lineTo(x,y);
        }
        if(st.p.length === 2) c.lineTo(st.p[0]/1000*W + 0.1, st.p[1]/1000*H);
        c.stroke();
      });
      c.globalCompositeOperation = 'source-over';

      var img = c.getImageData(0,0,W,H).data;
      var box = trimBounds(function(x,y){ return img[(y*W + x)*4 + 3]; }, W, H);
      if(!box) return null;

      var off = document.createElement('canvas');
      off.width = box.w; off.height = box.h;
      off.getContext('2d').drawImage(pad, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
      return { canvas: off, w: box.w, h: box.h, motion: art.m, face: art.f };
    },

    /* 캔버스 스프라이트 → 무대에 올릴 수 있는 Image */
    toImage: function(canvas, cb){
      var im = new Image();
      im.onload = function(){ cb(im); };
      im.src = canvas.toDataURL();
      return im;
    }
  };

  return {
    MAX_BEINGS:MAX_BEINGS, SPRITE_MAX_W:SPRITE_MAX_W, SPRITE_MAX_H:SPRITE_MAX_H,
    PAD_W:PAD_W, PAD_H:PAD_H,
    INK_MAX_STROKES:INK_MAX_STROKES, INK_MAX_PTS_PER_STROKE:INK_MAX_PTS_PER_STROKE,
    INK_MAX_PTS_TOTAL:INK_MAX_PTS_TOTAL, INK_MIN_STEP:INK_MIN_STEP,
    STAGES:STAGES, MOTIONS:MOTIONS, findStage:findStage, resolveMotion:resolveMotion, floorOf:floorOf,
    trimBounds:trimBounds, fitSize:fitSize,
    clampArt:clampArt, shouldAddPoint:shouldAddPoint, inkSize:inkSize,
    createBeing:createBeing, stepBeing:stepBeing,
    createPelletField:createPelletField, pickTarget:pickTarget,
    createStageRun:createStageRun,
    art: art, ink: ink
  };
});
