/* ═══════════════════════════════════════════════════════════════════
   케이뮤지엄 — museum.js
   전시 HTML은 이 API만 호출한다. API 밖에서 소리·플래시 자체 구현 금지.
   연출을 여기 한 곳에 모아 품질 하한을 보장한다.
   구현 근거: 무대미술_표준.md §5(캔버스·배반)·§6(사운드), SPEC 개관0호 §2.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── WebAudio 코어 (외부 파일 0, 전량 합성) ───────────────────────── */
var AC = null, master = null, _muted = false, _roomtone = null;
function ctx(){
  if(!AC){
    AC = new (window.AudioContext||window.webkitAudioContext)();
    master = AC.createGain();
    master.gain.value = 0.5;            // 마스터 −6dB 헤드룸
    master.connect(AC.destination);
  }
  if(AC.state === 'suspended') AC.resume();
  return AC;
}
function noiseBuffer(sec, type){       // type: 'white' | 'brown'
  var c = ctx(), n = Math.floor(c.sampleRate*sec), buf = c.createBuffer(1,n,c.sampleRate), d = buf.getChannelData(0);
  if(type === 'brown'){
    var last = 0;
    for(var i=0;i<n;i++){ var w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=last*3.2; }
  } else {
    for(var j=0;j<n;j++) d[j]=Math.random()*2-1;
  }
  return buf;
}
function env(node, t0, a, peak, d, dur){ // 어택-감쇠 게인 엔벨로프
  var g = ctx().createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0+a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+a+dur);
  node.connect(g); g.connect(master);
  return g;
}

/* §6 프리셋 7종 ------------------------------------------------------ */
var SOUND = {
  click_light:function(pitch){
    var c=ctx(), t=c.currentTime, p=1+(pitch||0);
    var o=c.createOscillator(); o.type='square'; o.frequency.value=1200*p;
    env(o,t,0.001,0.18,0,0.018); o.start(t); o.stop(t+0.03);
    var b=c.createOscillator(); b.type='sine'; b.frequency.value=220*p;
    env(b,t,0.003,0.12,0,0.06); b.start(t); b.stop(t+0.08);
  },
  curtain:function(){
    var c=ctx(), t=c.currentTime;
    var src=c.createBufferSource(); src.buffer=noiseBuffer(0.7,'white');
    var f=c.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.4;
    f.frequency.setValueAtTime(400,t); f.frequency.linearRampToValueAtTime(900,t+0.6);
    var g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.14,t+0.12);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.6);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t+0.7);
  },
  clack:function(){
    var c=ctx(), t=c.currentTime, jit=(Math.random()-0.5)*0.08; // 피치 ±4%
    var o=c.createOscillator(); o.type='triangle'; o.frequency.value=180*(1+jit);
    env(o,t,0.001,0.22,0,0.09); o.start(t); o.stop(t+0.1);
    var p=c.createOscillator(); p.type='sine'; p.frequency.value=2400*(1+jit);
    env(p,t,0.001,0.08,0,0.03); p.start(t); p.stop(t+0.04);
  },
  boom:function(){
    var c=ctx(), t=c.currentTime;
    var o=c.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(55,t); o.frequency.exponentialRampToValueAtTime(30,t+0.5);
    env(o,t,0.004,0.55,0,0.5); o.start(t); o.stop(t+0.55);
    var src=c.createBufferSource(); src.buffer=noiseBuffer(0.4,'white');
    var f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=180;
    var g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.3,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t+0.4);
  },
  chime:function(){
    var c=ctx(), t=c.currentTime, base=1567; // G6 + 배음 2개, 잔향 2.5s
    [1,2,3].forEach(function(h,i){
      var o=c.createOscillator(); o.type='sine'; o.frequency.value=base*h;
      var g=c.createGain(), peak=0.2/(h*h);
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(peak,t+0.005);
      g.gain.exponentialRampToValueAtTime(0.0001,t+2.5);
      o.connect(g); g.connect(master); o.start(t); o.stop(t+2.5);
    });
  },
  paper:function(){
    var c=ctx(), t=c.currentTime;
    var src=c.createBufferSource(); src.buffer=noiseBuffer(0.15,'white');
    var f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=2600;
    var g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.12,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t+0.15);
  },
  /* 캔버스 공통(무대미술 §5) — 분필 획: 하이패스 화이트노이즈 40ms */
  chalk:function(){
    var c=ctx(), t=c.currentTime;
    var src=c.createBufferSource(); src.buffer=noiseBuffer(0.05,'white');
    var f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=3200;
    var g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.05,t+0.006);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.04);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t+0.05);
  },
  /* 캔버스 공통 — 접기 삐걱: 저역 대역 노이즈, 진행도 비례 피치(pitch −.3~+.3) */
  creak:function(pitch){
    var c=ctx(), t=c.currentTime, p=1+(pitch||0);
    var src=c.createBufferSource(); src.buffer=noiseBuffer(0.08,'brown');
    var f=c.createBiquadFilter(); f.type='bandpass'; f.Q.value=3.5;
    f.frequency.value=140*p;
    var g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.05,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t+0.08);
  }
};

var _lastClack = 0;
function play(name, opt){
  if(_muted) return;
  opt = opt || {};
  if(name === 'clack'){                        // 40ms 미만 간격 스킵(포화 방지)
    var now = performance.now();
    if(now - _lastClack < 40) return;
    _lastClack = now;
  }
  if(name === 'roomtone'){ roomtone(true); return; }
  var fn = SOUND[name];
  if(fn) fn(opt.pitch || 0);
}
function roomtone(on){
  if(on){
    if(_roomtone || _muted) return;
    var c=ctx();
    var src=c.createBufferSource(); src.buffer=noiseBuffer(3,'brown'); src.loop=true;
    var g=c.createGain(); g.gain.value=0.0001;
    g.gain.linearRampToValueAtTime(0.013, c.currentTime+1.5); // −38dB 근사
    var hum=c.createOscillator(); hum.type='sine'; hum.frequency.value=60;
    var hg=c.createGain(); hg.gain.value=0.006;               // −44dB 근사
    src.connect(g); g.connect(master); hum.connect(hg); hg.connect(master);
    src.start(); hum.start();
    _roomtone = {src:src, hum:hum, g:g, hg:hg};
  } else if(_roomtone){
    try{ _roomtone.src.stop(); _roomtone.hum.stop(); }catch(e){}
    _roomtone = null;
  }
}
function mute(on){
  _muted = on;
  if(master) master.gain.value = on ? 0 : 0.5;
  if(on) roomtone(false);
}

/* ── 결정론 rng (케이랩 표준 mulberry32 이식) ─────────────────────── */
function rng(seed){
  var a = seed|0;
  return function(){
    a|=0; a=a+0x6D2B79F5|0;
    var t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}

/* ── §4a 명판 생성 + 등장 모션 ───────────────────────────────────── */
function plaque(o){
  o = o || {};
  var el = document.createElement('div');
  el.className = 'plaque' + (o.small ? ' plaque--small' : '');
  el.setAttribute('data-rise','');
  var html = '';
  if(o.title) html += '<span class="plaque__title '+(o.small?'t-teaser':'t-exhibit')+'">'+esc(o.title)+'</span>';
  if(o.story) html += '<span class="plaque__story t-story">'+esc(o.story)+'</span>';
  if(o.fine)  html += '<span class="plaque__story t-fine">'+esc(o.fine)+'</span>';
  el.innerHTML = html;
  var mount = o.mount || document.body;
  mount.appendChild(el);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('is-risen'); }); });
  return el;
}
function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }

/* ── §5 배반 시퀀스 (공통 함수) ──────────────────────────────────── */
var _inputLocked = false;
function betray(pt){
  pt = pt || {x:0.5, y:0.5};
  _inputLocked = true;
  Museum._locked = true;
  var layer = document.getElementById('flash-layer') || (function(){
    var l=document.createElement('div'); l.id='flash-layer'; document.body.appendChild(l); return l;
  })();
  var cx = (pt.x<=1 ? pt.x*100 : pt.x/window.innerWidth*100);
  var cy = (pt.y<=1 ? pt.y*100 : pt.y/window.innerHeight*100);
  layer.style.background = 'radial-gradient(circle at '+cx+'% '+cy+'%, var(--flash), transparent 60%)';
  return new Promise(function(resolve){
    // ② 플래시 180ms ease-out
    layer.style.transition='none'; layer.style.opacity='0';
    requestAnimationFrame(function(){
      layer.style.transition='opacity .09s ease-out';
      layer.style.opacity='1';
      // ③ boom + chime 동시
      play('boom'); play('chime');
      setTimeout(function(){
        layer.style.transition='opacity .18s ease-out';
        layer.style.opacity='0';
        // ④ 700ms 완전 정지(정적이 연출)
        window.dispatchEvent(new CustomEvent('museum:freeze'));
        setTimeout(function(){
          // ⑤ 여운 페이드 시작 · 입력 해제
          window.dispatchEvent(new CustomEvent('museum:unfreeze'));
          _inputLocked = false; Museum._locked = false;
          resolve();
        }, 700);
      }, 180);
    });
  });
}

/* ── 커튼 전환 ───────────────────────────────────────────────────── */
function curtainLayer(){
  var el = document.getElementById('curtain-layer');
  if(!el){
    el = document.createElement('div'); el.id='curtain-layer';
    el.style.cssText='position:fixed;inset:0;z-index:90;pointer-events:none;'+
      'background:repeating-linear-gradient(90deg,#0b0910 0 20px,#050508 20px 40px);'+
      'transform:scaleX(0);transform-origin:left;transition:transform .8s var(--ease-curtain);';
    document.body.appendChild(el);
  }
  return el;
}
function curtainTo(url){
  var el = curtainLayer();
  play('curtain');
  el.style.transformOrigin='left'; el.style.transform='scaleX(0)';
  requestAnimationFrame(function(){ el.style.transform='scaleX(1)'; });
  setTimeout(function(){ location.href = url; }, 820);
}
function curtainIn(){
  var el = curtainLayer();
  el.style.transition='none'; el.style.transformOrigin='right'; el.style.transform='scaleX(1)';
  play('curtain');
  requestAnimationFrame(function(){
    el.style.transition='transform .8s var(--ease-curtain)';
    el.style.transform='scaleX(0)';
  });
}

/* ── 티켓북 (localStorage — id 집합만, 개수 UI 없음) ──────────────── */
var TK_KEY = 'kmuseum.tickets';
function tkLoad(){ try{ return JSON.parse(localStorage.getItem(TK_KEY)||'{}'); }catch(e){ return {}; } }
function tkSave(o){ try{ localStorage.setItem(TK_KEY, JSON.stringify(o)); }catch(e){} }
var _ticket = {
  has:function(id){ return !!tkLoad()[id]; },
  all:function(){ return tkLoad(); },
  grant:function(o){                // {id, title, drawFn, fine}
    var store = tkLoad();
    if(store[o.id]) return false;   // 이미 보유 → 재발급 안 함
    store[o.id] = { title:o.title, fine:o.fine||'', date:new Date().toISOString().slice(0,10) };
    tkSave(store);
    _flyTicket(o);                  // 발급 모션
    return true;
  },
  openBook:function(){ window.dispatchEvent(new CustomEvent('museum:openbook')); }
};
function _flyTicket(o){
  var host = document.getElementById('ticket-fly');
  if(!host){ host=document.createElement('div'); host.id='ticket-fly'; document.body.appendChild(host); }
  host.innerHTML='';
  var card = buildTicketCard(o);
  host.appendChild(card);
  play('paper');
  host.style.transition='none'; host.style.opacity='0'; host.style.bottom='-200px';
  requestAnimationFrame(function(){
    host.style.transition='bottom .7s var(--ease-rise), opacity .4s ease';
    host.style.opacity='1'; host.style.bottom='38vh';
    setTimeout(function(){    // 1.2초 머문 뒤 우하단 티켓북으로 축소 비행
      host.style.transition='all .5s var(--ease-curtain)';
      host.style.left='auto'; host.style.right='24px'; host.style.bottom='24px';
      host.style.transform='translateX(0) scale(.12)'; host.style.opacity='0';
    }, 1500);
  });
}
function buildTicketCard(o){
  var t = document.createElement('div'); t.className='ticket';
  var art = document.createElement('div'); art.className='ticket__art';
  var cv = document.createElement('canvas'); cv.width=150; cv.height=376;
  art.appendChild(cv);
  if(o.drawFn){ try{ o.drawFn(cv.getContext('2d'), cv.width, cv.height); }catch(e){} }
  var body = document.createElement('div'); body.className='ticket__body';
  body.innerHTML='<div class="ticket__title t-exhibit">'+esc(o.title)+'</div>'+
                 '<div class="t-fine">관람 '+(o.date||new Date().toISOString().slice(0,10))+'</div>';
  t.appendChild(art); t.appendChild(body);
  return t;
}

/* ── §8.6 칠판 — 문제는 무대에 상주한다 ───────────────────────────
   칠판 문법(M1 v2가 세우고 S6가 검증):
   ① 문제 한 줄이 1막부터 여운까지 무대에 상주한다(증발 금지)
   ② 노동의 결과가 문제 위에 쌓인다(노동과 문제가 한 시야)
   ③ 기록은 수치가 아니라 크기로만(§8.5 원칙3 유지 — 이 부품은 수치를 그리지 않는다)
   ④ 배반 전에 칠판이 이미 답을 말한다(막대 하나만 우뚝한 그림)
   ⑤ 여운에서 칠판이 무대 한가운데로 내려와 답이 된다
   전시는 mark()만 부르면 된다. 칠판을 손으로 그리지 않는다. */
function board(o){
  o = o || {};
  var W=1600, H=900;
  var BX = (o.x!=null? o.x : W*0.12),
      BY = (o.y!=null? o.y : H*0.05),
      BW = (o.w!=null? o.w : W*0.76),
      BH = (o.h!=null? o.h : H*0.235);
  var slots = (o.slots||[]).map(function(s){
    return { id:s.id, label:s.label||'', v:0, lit:false };
  });
  var BASE = BY+BH-26, MAXH = BH-76;
  var AFTER_DY = (o.afterDy!=null? o.afterDy : H*0.26);
  var gauge = (o.gauge!=null? o.gauge : null);      // 기준 눈금(0..1) — 점선만, 라벨 없음
  var half = Math.max(28, Math.min(30, BW/(slots.length*2.6||1)));   // 막대 반폭
  var st = { question:String(o.question||''), answer:String(o.answer!=null? o.answer : (o.question||'')),
             after:false, move:0, alpha:0, time:0, chalk:'', chalkT:0 };

  function idx(id){ for(var i=0;i<slots.length;i++) if(slots[i].id===id) return i; return -1; }
  function slotX(i){
    if(slots.length===1) return BX+BW*0.5;
    var pad = BW*0.09;
    return BX + pad + (BW-2*pad) * (i/(slots.length-1));
  }
  function dy(){ return st.after ? AFTER_DY*st.move : 0; }

  var api = {
    x:BX, y:BY, w:BW, h:BH, base:BASE, maxh:MAXH,
    // 노동의 결과를 크기로 적는다(0..1). 수치는 적지 않는다.
    mark:function(id, v){
      var i=idx(id); if(i<0) return api;
      slots[i].v = Math.max(0, Math.min(1, v||0));
      return api;
    },
    value:function(id){ var i=idx(id); return i<0?0:slots[i].v; },
    // 배반 직전·여운에서 답이 되는 자리 하나가 우뚝해진다
    lit:function(id){
      for(var i=0;i<slots.length;i++) slots[i].lit = (slots[i].id===id);
      return api;
    },
    // 막이 바뀌면 문제도 바뀐다(두 세계를 견주는 전시) — 답은 여전히 숨어 있다
    ask:function(q, a){
      if(q!=null) st.question=String(q);
      if(a!=null) st.answer=String(a);
      return api;
    },
    // 막대가 맞지 않는 전시(배가·누적형)는 분필로 쓴다 — 노동이 문제 아래 쌓인다
    write:function(text){
      var t = (text==null? '' : String(text));
      if(t!==st.chalk){ st.chalk=t; st.chalkT=0; }
      return api;
    },
    chalk:function(){ return st.chalk; },
    // 여운 — 문제가 답이 되고, 칠판이 무대 한가운데로 내려온다
    resolve:function(){ st.after = true; return api; },
    // 물건이 칠판 제 자리로 날아갈 목적지(전시가 비행 궤적에 쓴다)
    slotXY:function(id){
      var i=idx(id); if(i<0) return [BX+BW*0.5, BASE+dy()];
      return [ slotX(i), BASE-24+dy() ];
    },
    isAfter:function(){ return st.after; },
    _state:st, _slots:slots,
    scene:{
      update:function(dt){
        st.time += dt;
        if(o.tick){ try{ o.tick(api, dt); }catch(e){} }               // 전시가 제 노동을 칠판에 적는다
        st.chalkT = Math.min(1, st.chalkT + dt/0.35);                 // 분필이 그어지는 시간
        if(st.alpha<1) st.alpha = Math.min(1, st.alpha + dt/1.2);     // 1막에 스스로 떠오른다
        if(st.after && st.move<1) st.move = Math.min(1, st.move + dt/1.1);
      },
      draw:function(ctx){
        var d=dy(), a=st.alpha;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(0, d);
        ctx.fillStyle='rgba(12,14,18,.55)';
        ctx.fillRect(BX, BY, BW, BH);
        ctx.strokeStyle='rgba(201,169,97,.34)'; ctx.lineWidth=1.4;
        ctx.strokeRect(BX, BY, BW, BH);

        // 문제 — 끝까지 무대에 남는다. 여운에서만 답이 된다.
        ctx.font='20px "Gowun Batang", serif';
        ctx.fillStyle='rgba(242,234,216,.72)'; ctx.textAlign='center';
        ctx.fillText(st.after ? st.answer : st.question, BX+BW*0.5, BY+34);

        // 바닥선
        ctx.strokeStyle='rgba(168,158,136,.34)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(BX+22, BASE); ctx.lineTo(BX+BW-22, BASE); ctx.stroke();

        // 기준 눈금 — 소품일 뿐, 수치는 없다
        if(gauge!=null){
          var gy = BASE - MAXH*gauge;
          ctx.strokeStyle='rgba(201,169,97,.30)'; ctx.lineWidth=1;
          ctx.setLineDash([4,6]);
          ctx.beginPath(); ctx.moveTo(BX+22, gy); ctx.lineTo(BX+BW-22, gy); ctx.stroke();
          ctx.setLineDash([]);
        }

        // 분필 줄 — 노동의 기록. 칠판이 감당 못 할 만큼 길어지면, 그 사실이 이미 답이다.
        if(st.chalk){
          var size=34, maxW=BW-64;
          ctx.font=size+'px "Gowun Batang", serif';
          var wid=ctx.measureText(st.chalk).width;
          while(wid>maxW && size>15){
            size-=2; ctx.font=size+'px "Gowun Batang", serif';
            wid=ctx.measureText(st.chalk).width;
          }
          ctx.textAlign='center';
          ctx.fillStyle='rgba(242,234,216,'+(0.55+0.35*st.chalkT).toFixed(2)+')';
          ctx.fillText(st.chalk, BX+BW*0.5, BY + BH*(slots.length? 0.62 : 0.72));
        }

        for(var i=0;i<slots.length;i++){
          var s=slots[i], cx=slotX(i), v=s.v;
          // 아직 답하지 않은 자리
          ctx.strokeStyle='rgba(168,158,136,'+(v>0?0.18:0.30).toFixed(2)+')';
          ctx.setLineDash([3,5]); ctx.lineWidth=1;
          ctx.beginPath();
          ctx.moveTo(cx-half, BASE); ctx.lineTo(cx-half, BASE-MAXH);
          ctx.moveTo(cx+half, BASE); ctx.lineTo(cx+half, BASE-MAXH);
          ctx.stroke();
          ctx.setLineDash([]);
          // 적힌 것 — 크기가 전부다
          if(v>0){
            var hgt = MAXH*v;
            ctx.fillStyle='rgba(242,234,216,'+(s.lit?0.95:0.80)+')';
            ctx.fillRect(cx-half, BASE-hgt, half*2, hgt);
            ctx.strokeStyle = s.lit ? 'rgba(201,169,97,.95)' : 'rgba(242,234,216,.95)';
            ctx.lineWidth   = s.lit ? 2.2 : 1.2;
            ctx.strokeRect(cx-half, BASE-hgt, half*2, hgt);
            if(hgt<3){                                  // 아무것도 남지 않은 자리 — 분필 한 획
              ctx.strokeStyle='rgba(242,234,216,.55)'; ctx.lineWidth=2;
              ctx.beginPath(); ctx.moveTo(cx-half, BASE); ctx.lineTo(cx+half, BASE); ctx.stroke();
            }
          }
          if(s.label){
            ctx.font='13px "Gowun Dodum", sans-serif';
            ctx.fillStyle='rgba(168,158,136,'+(v>0?0.72:0.42).toFixed(2)+')';
            ctx.textAlign='center';
            ctx.fillText(s.label, cx, BASE+20);
          }
        }
        ctx.restore();
      }
    }
  };
  return api;
}

/* ── §5 stage — 1600×900 캔버스 헬퍼 ─────────────────────────────── */
function stage(canvas){
  var LW=1600, LH=900, DPR=Math.min(window.devicePixelRatio||1, 1.5);
  var ctx2 = canvas.getContext('2d');
  var scenes = [], raf=0, last=0, frozen=false;

  function resize(){
    var box = canvas.getBoundingClientRect();
    var scale = Math.min(box.width/LW, box.height/LH);     // contain
    canvas.width  = Math.round(box.width*DPR);
    canvas.height = Math.round(box.height*DPR);
    ctx2.setTransform(1,0,0,1,0,0);
    var ox = (box.width  - LW*scale)/2*DPR;
    var oy = (box.height - LH*scale)/2*DPR;
    ctx2.setTransform(scale*DPR,0,0,scale*DPR, ox, oy);    // 논리좌표 → 화면
    api._scale = scale;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('museum:freeze',   function(){ frozen=true;  });
  window.addEventListener('museum:unfreeze', function(){ frozen=false; last=performance.now(); });

  // 글로우 스프라이트 — 오프스크린 1회 렌더 후 drawImage 재사용
  var glowCache = {};
  function glow(radius, color){
    var key = radius+'|'+color;
    if(glowCache[key]) return glowCache[key];
    var s=Math.ceil(radius*2), off=document.createElement('canvas'); off.width=off.height=s;
    var oc=off.getContext('2d');
    var g=oc.createRadialGradient(radius,radius,0,radius,radius,radius);
    g.addColorStop(0,color); g.addColorStop(1,'rgba(0,0,0,0)');
    oc.fillStyle=g; oc.fillRect(0,0,s,s);
    glowCache[key]=off; return off;
  }

  function loop(now){
    raf=requestAnimationFrame(loop);
    var dt = Math.min((now-last)/1000, 0.05); last=now;   // dt 상한 50ms
    ctx2.clearRect(-LW,-LH,LW*3,LH*3);
    for(var i=0;i<scenes.length;i++){
      var s=scenes[i];
      if(!frozen && s.update) s.update(dt);
      if(s.draw) s.draw(ctx2);
    }
  }
  var api = {
    W:LW, H:LH, ctx:ctx2, _scale:1,
    add:function(scene){ scenes.push(scene); return scene; },
    clear:function(){ scenes.length=0; },
    glow:glow,
    toLogical:function(clientX, clientY){        // 화면 → 논리 좌표
      var box=canvas.getBoundingClientRect();
      var scale=api._scale;
      var ox=(box.width-LW*scale)/2, oy=(box.height-LH*scale)/2;
      return { x:(clientX-box.left-ox)/scale, y:(clientY-box.top-oy)/scale };
    },
    start:function(){ if(!raf){ last=performance.now(); resize(); raf=requestAnimationFrame(loop); } },
    stop:function(){ cancelAnimationFrame(raf); raf=0; }
  };
  resize();
  return api;
}

/* ── §5.5 grip — 손을 놓치지 않는다 (전자칠판 표준) ────────────────
   드래그·홀드 전시의 라이브 결함 3종을 코어가 한자리에서 막는다.
   E2는 무대 훅(window.__XX)을 직접 찔러 막을 넘기므로, 아래 셋은
   테스트가 전부 초록이어도 실기기에서만 죽는다(M4·M7 정지화면과 같은 계열):

     ① 놓친 손    — 손이 캔버스를 벗어나면 pointermove가 끊긴다 → "끌다가 만다"
     ② 굳은 손    — pointerup을 canvas에 건 전시는 밖에서 뗀 손을 영영 못 받는다
                     → dragging이 참인 채로 남아, 이후 스치는 손에도 세계가 끌려간다
     ③ 취소된 손  — 전자칠판 팜 리젝션·제스처 가로채기는 pointerup 없이
                     pointercancel만 보낸다 → 역시 굳는다

   grip은 pointerdown에서 포인터를 캡처하고(①·② 해소),
   취소·캡처상실 시 마지막 좌표로 pointerup을 재발행한다(③ 해소).
   재발행은 버블링되므로 전시의 up 핸들러가 canvas에 걸렸든 window에 걸렸든
   그대로 살아난다 — 전시 코드는 `Museum.grip(canvas)` 한 줄이면 끝. */
function synthUp(id, x, y){
  var ev;
  try{
    ev = new PointerEvent('pointerup', { pointerId:id, clientX:x, clientY:y, bubbles:true, cancelable:true });
  }catch(_){                                   // PointerEvent 미지원 환경(jsdom 등)
    ev = document.createEvent('Event');
    ev.initEvent('pointerup', true, true);
    try{
      Object.defineProperty(ev,'pointerId',{value:id});
      Object.defineProperty(ev,'clientX', {value:x});
      Object.defineProperty(ev,'clientY', {value:y});
    }catch(__){ ev.pointerId=id; ev.clientX=x; ev.clientY=y; }
  }
  ev._museumSynth = true;
  return ev;
}
function grip(canvas){
  var live = {};                               // 살아 있는 포인터 → 마지막 좌표
  function track(e){ live[e.pointerId] = { x:e.clientX, y:e.clientY }; }

  canvas.addEventListener('pointerdown', function(e){
    if(canvas.setPointerCapture){ try{ canvas.setPointerCapture(e.pointerId); }catch(_){} }
    track(e);
  }, true);                                    // 캡처 단계 — 전시 핸들러보다 먼저 손을 잡는다
  canvas.addEventListener('pointermove', function(e){ if(live[e.pointerId]) track(e); }, true);
  canvas.addEventListener('pointerup',   function(e){ delete live[e.pointerId]; }, true);

  function rescue(e){
    var last = live[e.pointerId];
    if(!last) return;                          // 이미 정상적으로 뗀 손 — 재발행 없음
    delete live[e.pointerId];
    canvas.dispatchEvent(synthUp(e.pointerId, last.x, last.y));   // 버블링 → window 핸들러도 받는다
  }
  canvas.addEventListener('pointercancel',      rescue);
  canvas.addEventListener('lostpointercapture', rescue);
  return canvas;
}

/* ── 공개 API 조립 ───────────────────────────────────────────────── */
window.Museum = {
  grip:grip,                           // §5.5 손을 놓치지 않는다
  sound:{ play:play, roomtone:roomtone, mute:mute },
  betray:betray,
  plaque:plaque,
  ticket:_ticket,
  curtainTo:curtainTo,
  curtainIn:curtainIn,
  rng:rng,
  stage:stage,
  board:board,                         // §8.6 칠판 — 문제는 무대에 상주한다
  buildTicketCard:buildTicketCard,     // 티켓북 UI가 재사용
  _locked:false,
  isLocked:function(){ return _inputLocked; }
};

})();
